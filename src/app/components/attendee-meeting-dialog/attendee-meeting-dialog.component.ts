import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MeetingService } from '../../services/meeting.service';
import { concatMap, map, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { ParticipantService } from '../../services/participant.service';
import { CommonService } from '../../services/common.service';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-attendee-meeting-dialog',
    templateUrl: './attendee-meeting-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
          confirm("This meeting has ended.");
          this.dialog.close();
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
          this.commonService.openSnackBar("The meeting failed to load. Please try again.");
          this.dialog.close();
        }
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
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
        this.commonService.openSnackBar("Join meeting successfully.");
      }
    });
  }

  handleVideoConferenceLeft = async (_participant: MeetingParticipant) => {
    this.participantService.update(this.dialog_data.event_id, {})
      .subscribe({
        next: () => {
          this.commonService.openSnackBar("Leave meeting successfully.");
        }
      });
  }

}
