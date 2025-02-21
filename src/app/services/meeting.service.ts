import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateMeetingResponse, GetMeetingResponse } from '../models/Meeting';
import { GeneralResponse, Response } from '../models/Utils';
import { Router } from '@angular/router';
declare var JitsiMeetExternalAPI: any;

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private http = inject(HttpClient);
  private route = inject(Router);

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

}
