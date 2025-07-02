import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrl: './private.component.scss'
})
export class PrivateComponent {
  private route = inject(Router);

  logout() {
    const isConfirmed = confirm("Are you sure to logout?");

    if (isConfirmed) {
      localStorage.removeItem("token");
      this.route.navigateByUrl("login");
    }
  }

  get isAttendee() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    return decoded.role === "attendee";
  }

  get isOrganizer() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    return decoded.role === "organizer";
  }

  get profile_url() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    if (decoded.profile) {
      if (decoded.googleId) {
        return decoded.profile;
      } else {
        return environment.profileUrl + "/" + decoded.profile;
      }
    }

    return "assets/images/placeholder_person.png";
  }
}
