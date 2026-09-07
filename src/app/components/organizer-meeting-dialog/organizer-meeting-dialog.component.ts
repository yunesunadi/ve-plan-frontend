import { Component, ElementRef, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { filter } from 'rxjs';
import { ApiError } from '../../models/ApiError';
import { MeetingService } from '../../services/meeting.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

interface DialogError {
  icon: string;
  title: string;
  message: string;
  canRetry: boolean;
}

@Component({
  selector: 'app-organizer-meeting-dialog',
  templateUrl: './organizer-meeting-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './organizer-meeting-dialog.component.scss',
  imports: [CdkScrollable, MatDialogContent, MatButton, MatIcon],
})
export class OrganizerMeetingDialogComponent {
  private frame = viewChild<ElementRef<HTMLElement>>('jitsi_iframe');

  private meetingService = inject(MeetingService);
  private dialog_data = inject<{ event_id: string; event_title?: string }>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);

  private api: any;
  protected readonly meetingTitle = `${this.dialog_data.event_title ?? 'Event'} meeting`;

  protected readonly phase = signal<'loading' | 'live' | 'error'>('loading');
  protected readonly errorView = signal<DialogError | null>(null);
  protected readonly liveAnnouncement = signal('');
  protected readonly isEnding = signal(false);
  protected readonly endError = signal('');

  ngOnDestroy() {
    this.api?.dispose();
  }

  ngAfterViewInit(): void {
    this.initMeeting();
  }

  retry(): void {
    this.errorView.set(null);
    this.phase.set('loading');
    this.initMeeting();
  }

  close(): void {
    this.dialog.close();
  }

  private initMeeting(): void {
    this.meetingService.createToken(this.dialog_data.event_id).subscribe({
      next: async (res) => {
        try {
          this.api = await this.meetingService.createJitsiMeeting(
            { room_name: res.room_name, token: res.token },
            this.frame()!,
            true,
          );

          this.phase.set('live');
          this.api.addEventListeners({
            readyToClose: this.handleClose,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
          });
        } catch {
          this.showError({
            icon: 'wifi_off',
            title: "The meeting couldn't load",
            message: 'The 8x8 meeting library failed to load. Check your connection and try again.',
            canRetry: true,
          });
        }
      },
      error: (err: unknown) => {
        const message = err instanceof ApiError && err.message
          ? err.message
          : 'We could not create a meeting token. Please try again.';
        this.showError({ icon: 'error_outline', title: "Couldn't join the meeting", message, canRetry: true });
      },
    });
  }

  private showError(error: DialogError): void {
    this.errorView.set(error);
    this.phase.set('error');
  }

  leaveAndEnd(): void {
    this.confirmService.confirm({
      title: 'End the meeting for everyone?',
      body: 'Leaving will end the meeting for everyone. Attendees will no longer be able to join.',
      confirmLabel: 'End meeting',
      destructive: true,
    }).pipe(filter(Boolean)).subscribe(() => this.endMeeting());
  }

  private handleClose = () => {
    // Fallback exit path (kick / error): still end the meeting for everyone.
    this.endMeeting();
  };

  private handleVideoConferenceJoined = (_participant: MeetingParticipant) => {
    this.liveAnnouncement.set('You joined the meeting.');
    this.meetingService.updateStartTime(this.dialog_data.event_id).subscribe({
      next: () => this.commonService.success('Meeting started.'),
    });
  };

  private handleVideoConferenceLeft = (_participant: MeetingParticipant) => {
    this.liveAnnouncement.set('You left the meeting.');
    this.endMeeting();
  };

  private endMeeting(): void {
    if (this.isEnding()) return;
    this.isEnding.set(true);
    this.endError.set('');

    this.meetingService.end(this.dialog_data.event_id).subscribe({
      next: () => {
        this.api?.dispose();
        this.api = null;
        this.commonService.success('Meeting ended.');
        this.dialog.close(true);
      },
      error: (err: unknown) => {
        this.isEnding.set(false);
        const message = err instanceof ApiError && err.message
          ? err.message
          : "Couldn't end the meeting. Please try again.";
        this.endError.set(message);
        this.commonService.error(message);
      },
    });
  }
}
