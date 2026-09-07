import { Component, ElementRef, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { MeetingService } from '../../services/meeting.service';
import { concatMap, map, of } from 'rxjs';
import { ApiError } from '../../models/ApiError';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { ParticipantService } from '../../services/participant.service';
import { CommonService } from '../../services/common.service';
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
  selector: 'app-attendee-meeting-dialog',
  templateUrl: './attendee-meeting-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './attendee-meeting-dialog.component.scss',
  imports: [CdkScrollable, MatDialogContent, MatButton, MatIcon],
})
export class AttendeeMeetingDialogComponent {
  private frame = viewChild<ElementRef<HTMLElement>>('jitsi_iframe');

  private meetingService = inject(MeetingService);
  private participantService = inject(ParticipantService);
  private dialog_data = inject<{ event_id: string; event_title?: string }>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);

  private api: any;
  private room_name = signal('');
  protected readonly meetingTitle = `${this.dialog_data.event_title ?? 'Event'} meeting`;

  protected readonly phase = signal<'loading' | 'live' | 'error' | 'ended'>('loading');
  protected readonly errorView = signal<DialogError | null>(null);
  protected readonly liveAnnouncement = signal('');

  ngOnDestroy() {
    this.api?.dispose();
  }

  ngAfterViewInit(): void {
    this.connect();
  }

  retry(): void {
    this.errorView.set(null);
    this.phase.set('loading');
    this.connect();
  }

  close(): void {
    this.api?.dispose();
    this.dialog.close();
  }

  private connect(): void {
    this.meetingService.getOneByEventId(this.dialog_data.event_id).pipe(
      map((res) => res.data),
      concatMap((meeting) => {
        if (meeting.ended) return of({ ended: true as const });
        return this.meetingService.createToken(this.dialog_data.event_id).pipe(
          map((data) => ({ ended: false as const, room_name: data.room_name, token: data.token })),
        );
      }),
    ).subscribe({
      next: async (data) => {
        if (data.ended) {
          this.phase.set('ended');
          return;
        }

        try {
          this.room_name.set(data.room_name);
          this.api = await this.meetingService.createJitsiMeeting(
            { room_name: data.room_name, token: data.token },
            this.frame()!,
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
          : 'We could not connect you to the meeting. Please try again.';
        this.showError({ icon: 'error_outline', title: "Couldn't join the meeting", message, canRetry: true });
      },
    });
  }

  private showError(error: DialogError): void {
    this.errorView.set(error);
    this.phase.set('error');
  }

  private handleClose = () => {
    this.api?.dispose();
    this.dialog.close();
  };

  private handleVideoConferenceJoined = (_participant: MeetingParticipant) => {
    this.liveAnnouncement.set('You joined the meeting.');
    this.participantService.create(this.dialog_data.event_id, this.room_name()).subscribe({
      next: () => this.commonService.success('You joined the meeting.'),
    });
  };

  private handleVideoConferenceLeft = (_participant: MeetingParticipant) => {
    this.liveAnnouncement.set('You left the meeting.');
    this.participantService.update(this.dialog_data.event_id, {}).subscribe({
      next: () => this.commonService.success('You left the meeting.'),
    });
  };
}
