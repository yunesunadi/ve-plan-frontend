import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, PageQuery } from '../models/Utils';
import { GetEventAcceptedInvitesResponse, GetEventInvitesResponse, GetPagedEventInvitesResponse } from '../models/EventInvite';

@Injectable({
  providedIn: 'root'
})
export class EventInviteService {
  private http = inject(HttpClient);

  constructor() { }

  invite(user_id_list: string[], event_id: string) {
    const url = `${environment.apiUrl}/event_invites`;
    return this.http.post<GeneralResponse>(url, { user_id_list, event_id });
  }

  getAllByEventId(event_id: string) {
    const url = `${environment.apiUrl}/event_invites/${event_id}/users`;
    return this.http.get<GetEventInvitesResponse>(url);
  }

  getAllAcceptedByEventId(event_id: string) {
    const url = `${environment.apiUrl}/event_invites/${event_id}/accepted_users`;
    return this.http.get<GetEventAcceptedInvitesResponse>(url);
  }

  getAllByUserId(query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/event_invites/events`;
    return this.http.get<GetPagedEventInvitesResponse>(url, { params: this.pageParams(query) });
  }

  getAllAcceptedByUserId(query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/event_invites/accepted_events`;
    return this.http.get<GetPagedEventInvitesResponse>(url, { params: this.pageParams(query) });
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

  accept_invite(event_id: string) {
    const url = `${environment.apiUrl}/event_invites/accept`;
    return this.http.put<GeneralResponse>(url, { event_id });
  }

  startMeeting(user_id_list: string[], event_id: string) {
    const url = `${environment.apiUrl}/event_invites/meeting_started`;
    return this.http.put<GeneralResponse>(url, { user_id_list, event_id });
  }
}
