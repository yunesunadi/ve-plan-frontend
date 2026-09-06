import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MeetingService } from '../../services/meeting.service';
import { concatMap, map, of } from 'rxjs';
import { ApiError } from '../../models/ApiError';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { ParticipantService } from '../../services/participant.service';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-attendee-meeting-dialog',
    templateUrl: './attendee-meeting-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './attendee-meeting-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent]
})
export class AttendeeMeetingDialogComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe!: ElementRef;

  private meetingService = inject(MeetingService);
  private participantService = inject(ParticipantService);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);

  api: any;
  room_name = signal("");

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  ngAfterViewInit(): void {
    this.meetingService.getOneByEventId(this.dialog_data.event_id).pipe(
      map((res) => res.data),
      concatMap((meeting) => {
        if (meeting.ended) {
          return of({ ended: true as const });
        }

        return this.meetingService.createToken(this.dialog_data.event_id).pipe(
          map((data) => ({
            ended: false as const,
            room_name: data.room_name,
            token: data.token,
          }))
        );
      }),
    ).subscribe({
      next: async (data) => {
        if (data.ended) {
          this.confirmService.acknowledge(
            "This meeting has ended",
            "The organizer has closed this meeting. You can rejoin if it's re-opened.",
            "Close"
          ).subscribe(() => this.dialog.close());
          return;
        }

        try {
          this.room_name.set(data.room_name);
          this.api = await this.meetingService.createJitsiMeeting(
            { room_name: data.room_name, token: data.token },
            this.jitsi_iframe
          );

          this.api.addEventListeners({
            readyToClose: this.handleClose,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
          });
        } catch {
          this.commonService.error("The meeting failed to load. Please try again.");
          this.dialog.close();
        }
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
        this.dialog.close();
      }
    });
  }

  handleClose = () => {
    this.api.dispose();
    this.dialog.close();
  }

  handleVideoConferenceJoined = async (_participant: MeetingParticipant) => {
    this.participantService.create({
      event: this.dialog_data.event_id,
      room_name: this.room_name(),
    }).subscribe({
      next: () => {
        this.commonService.success("Join meeting successfully.");
      }
    });
  }

  handleVideoConferenceLeft = async (_participant: MeetingParticipant) => {
    this.participantService.update(this.dialog_data.event_id, {})
      .subscribe({
        next: () => {
          this.commonService.success("Leave meeting successfully.");
        }
      });
  }

}
