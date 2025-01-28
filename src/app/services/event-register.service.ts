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

  getAll(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/event_registers/${event_id}/users`;
    return this.http.get<GetEventRegistersResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
}
