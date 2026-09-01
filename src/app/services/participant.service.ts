import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetParticipantsResponse, GetStayTimesResponse, Participant } from '../models/Participant';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private http = inject(HttpClient);

  constructor() { }

  create(participant: Partial<Participant>) {
    const url = `${environment.apiUrl}/participants`;
    return this.http.post<GeneralResponse>(url, participant);
  }

  update(event_id: string, participant: Partial<Participant>) {
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.put<GeneralResponse>(url, participant);
  }

  updateNoEndTime(event_id: string) {
    const url = `${environment.apiUrl}/participants/${event_id}/no_end_time`;
    return this.http.put<GeneralResponse>(url, {});
  }

  getAllByEventId(event_id: string) {
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.get<GetParticipantsResponse>(url);
  }

  getStayTimes(event_id: string) {
    const url = `${environment.apiUrl}/participants/${event_id}/stay_times`;
    return this.http.get<GetStayTimesResponse>(url);
  }
}
