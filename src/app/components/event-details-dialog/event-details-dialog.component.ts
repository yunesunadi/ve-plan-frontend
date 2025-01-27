import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { map, shareReplay } from 'rxjs';
import { format } from 'date-fns';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-event-details-dialog',
  templateUrl: './event-details-dialog.component.html',
  styleUrl: './event-details-dialog.component.scss'
})
export class EventDetailsDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private dialog = inject(MatDialogRef<this>);
  private route = inject(Router);

  event$ = this.eventService.getOneById(this.dialog_data.id).pipe(
    map(res => res.data),
    shareReplay(1)
  );

  role$ = this.userService.hasRole().pipe(
    map((res) => res.role)
  );

  constructor() {}

  get cover_url() {
    return environment.coverUrl;
  }

  navigate(url: string) {
    this.route.navigateByUrl(url);
    this.dialog.close();
  }

}
