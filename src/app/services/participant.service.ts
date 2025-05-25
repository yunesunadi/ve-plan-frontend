import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/participants`;
    return this.http.post<GeneralResponse>(url, participant, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  update(event_id: string, participant: Partial<Participant>) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.put<GeneralResponse>(url, participant, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAllByEventId(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/participants/${event_id}`;
    return this.http.get<GetParticipantsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getStayTimes(event_id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/participants/${event_id}/stay_times`;
    return this.http.get<GetStayTimesResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
}
