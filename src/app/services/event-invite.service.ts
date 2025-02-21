import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';
import { GetEventAcceptedInvitesResponse, GetEventInvitesResponse } from '../models/EventInvite';

@Injectable({
  providedIn: 'root'
})
export class EventInviteService {
  private http = inject(HttpClient);

  constructor() { }

  invite(user_id: string, event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites`;
    return this.http.post<GeneralResponse>(
      url, 
      {
        user_id,
        event_id
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      }
    );
  }
  
  getAllByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/${event_id}/users`;
    return this.http.get<GetEventInvitesResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllAcceptedByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/${event_id}/accepted_users`;
    return this.http.get<GetEventAcceptedInvitesResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllByUserId() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/events`;
    return this.http.get<GetEventInvitesResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllAcceptedByUserId() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/accepted_events`;
    return this.http.get<GetEventAcceptedInvitesResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  accept_invite(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/accept`;
    return this.http.put<GeneralResponse>(
      url,
      {
        event_id
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      }
    );
  }

  startMeeting(user_id: string, event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_invites/meeting_started`;
    return this.http.put<GeneralResponse>(
      url,
      {
        user_id,
        event_id
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      }
    );
  }
}
