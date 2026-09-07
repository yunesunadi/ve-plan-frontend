import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetPagedParticipantsResponse, GetStayTimesResponse, Participant } from '../models/Participant';
import { environment } from '../../environments/environment';
import { GeneralResponse, PageQuery } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private http = inject(HttpClient);

  constructor() { }

  create(event_id: string, room_name: string) {
    const url = `${environment.apiUrl}/participants`;
    return this.http.post<GeneralResponse>(url, { event: event_id, room_name });
  }

  update(event_id: string, participant: Partial<Participant>) {
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.put<GeneralResponse>(url, participant);
  }

  updateNoEndTime(event_id: string) {
    const url = `${environment.apiUrl}/participants/${event_id}/no_end_time`;
    return this.http.put<GeneralResponse>(url, {});
  }

  getAllByEventId(event_id: string, query?: Partial<PageQuery>) {
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.get<GetPagedParticipantsResponse>(url, { params: this.pageParams(query) });
  }

  getStayTimes(event_id: string) {
    const url = `${environment.apiUrl}/participants/${event_id}/stay_times`;
    return this.http.get<GetStayTimesResponse>(url);
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
}
