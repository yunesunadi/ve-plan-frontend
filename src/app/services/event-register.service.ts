import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, Response } from '../models/Utils';
import { GetEventRegistersResponse } from '../models/EventRegister';

@Injectable({
  providedIn: 'root'
})
export class EventRegisterService {
  private http = inject(HttpClient);

  constructor() { }

  register(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers`;
    return this.http.post<GeneralResponse>(url, { event_id }, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  unregister(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}`;
    return this.http.delete<GeneralResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  hasRegistered(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}`;
    return this.http.get<Response<"has_registered", boolean>>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  isRegisterApproved(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}/approved`;
    return this.http.get<Response<"is_register_approved", boolean>>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}/users`;
    return this.http.get<GetEventRegistersResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllApprovedByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}/users/approved`;
    return this.http.get<GetEventRegistersResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllByUserId() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/events`;
    return this.http.get<GetEventRegistersResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  approve(user_id: string, event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/approve`;
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

  startMeeting(user_id: string, event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/meeting_started`;
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
