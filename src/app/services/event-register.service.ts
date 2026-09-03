import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, PageQuery, Response } from '../models/Utils';
import { GetEventRegistersResponse, GetPagedEventRegistersResponse } from '../models/EventRegister';

@Injectable({
  providedIn: 'root'
})
export class EventRegisterService {
  private http = inject(HttpClient);

  constructor() { }

  register(event_id: string) {
    const url = `${environment.apiUrl}/event_registers`;
    return this.http.post<GeneralResponse>(url, { event_id });
  }

  unregister(event_id: string) {
    const url = `${environment.apiUrl}/event_registers/${event_id}`;
    return this.http.delete<GeneralResponse>(url);
  }

  hasRegistered(event_id: string) {
    const url = `${environment.apiUrl}/event_registers/${event_id}`;
    return this.http.get<Response<"has_registered", boolean>>(url);
  }

  isRegisterApproved(event_id: string) {
    const url = `${environment.apiUrl}/event_registers/${event_id}/approved`;
    return this.http.get<Response<"is_register_approved", boolean>>(url);
  }

  private pageParams(query?: Partial<PageQuery>) {
    let params = new HttpParams();
    if (query) {
      if (query.limit) {
        params = params.set("limit", query.limit);
      }
      if (query.offset) {
        params = params.set("offset", query.offset);
      }
    }
    return params;
  }

  getAllByEventId(event_id: string, query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/event_registers/${event_id}/users`;
    return this.http.get<GetPagedEventRegistersResponse>(url, { params: this.pageParams(query) });
  }

  getAllApprovedByEventId(event_id: string) {
    const url = `${environment.apiUrl}/event_registers/${event_id}/users/approved`;
    return this.http.get<GetEventRegistersResponse>(url);
  }

  getAllByUserId(query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/event_registers/events`;
    return this.http.get<GetPagedEventRegistersResponse>(url, { params: this.pageParams(query) });
  }

  getAllApprovedByUserId(query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/event_registers/events/approved`;
    return this.http.get<GetPagedEventRegistersResponse>(url, { params: this.pageParams(query) });
  }

  approve(user_id_list: string[], event_id: string) {
    const url = `${environment.apiUrl}/event_registers/approve`;
    return this.http.put<GeneralResponse>(url, { user_id_list, event_id });
  }

  startMeeting(user_id_list: string[], event_id: string) {
    const url = `${environment.apiUrl}/event_registers/meeting_started`;
    return this.http.put<GeneralResponse>(url, { user_id_list, event_id });
  }
}
