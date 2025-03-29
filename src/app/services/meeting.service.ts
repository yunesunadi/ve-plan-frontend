import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateMeetingResponse, GetMeetingResponse, Meeting } from '../models/Meeting';
import { GeneralResponse, Response } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private http = inject(HttpClient);

  constructor() { }

  createToken(is_moderator: boolean) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/token`;
    return this.http.post<GeneralResponse & Response<"token", string>>(
      url,
      { is_moderator },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      }
    );
  }

  start(event: string, room_name: string, meeting_token: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings`;
    return this.http.post<CreateMeetingResponse>(
      url,
      {
        event,
        room_name,
        token: meeting_token,
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      }
    );
  }

  isCreated(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/is_created`;
    return this.http.get<GeneralResponse & { is_created: boolean; }>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  isStarted(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/is_started`;
    return this.http.get<GeneralResponse & { is_started: boolean; }>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  getOneById(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}`;
    return this.http.get<GetMeetingResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getOneByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/attendee`;
    return this.http.get<GetMeetingResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  isExpired(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/is_expired`;
    return this.http.get<GeneralResponse & { is_expired: boolean; }>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  updateStartTime(event_id: string, meeting: Partial<Meeting>) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/start_time`;
    return this.http.put<GeneralResponse>(url, meeting, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  updateEndTime(event_id: string, meeting: Partial<Meeting>) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/meetings/${event_id}/end_time`;
    return this.http.put<GeneralResponse>(url, meeting, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

}
