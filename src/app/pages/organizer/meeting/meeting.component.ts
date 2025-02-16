import { Component, inject } from '@angular/core';
import { EventRegisterService } from '../../../services/event-register.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, concatMap, map, of, switchMap } from 'rxjs';
import { EventInviteService } from '../../../services/event-invite.service';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private meetingService = inject(MeetingService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);

  registered_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventRegisterService.getAllByEventId(params.id)),
    map((res) => res.data)
  );

  invite_accepted_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
    map((res) => res.data)
  );

  attendees$ = combineLatest([
    this.registered_users$,
    this.invite_accepted_users$
  ]).pipe(
    map((res) => {
      const users = [...res[0], ...res[1]];
      const unique_users = [...new Map(users.map(item => [item.user._id, item])).values()];
      
      return unique_users.map((item, index) => ({
        id: index + 1,
        name: item.user.name
      }));
    })
  );

  is_created$ =  this.aroute.params.pipe(
    concatMap((params: any) => this.meetingService.isCreated(params.id).pipe(
      map((res) => res.is_created),
    ))
  );

  create() {
    this.aroute.params.pipe(
      concatMap((params: any) => this.meetingService.createToken().pipe(
        map((res) => res.token),
        concatMap((token) => this.meetingService.start(params.id, "some string", token))
      ))
    )
    .subscribe({
      next: (res) => {
        this.commonService.openSnackBar(res.message);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
   
  }

  join() {

  }
  
  ngOnInit() {
    this.attendees$.subscribe(
      (res) => {
        console.log(res);
        
      }
    )
  }
  

}
