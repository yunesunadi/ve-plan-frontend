import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse } from '../models/Event';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  create(event: Event) {
    const url = `${environment.apiUrl}/events`;
    const token = localStorage.getItem("token");
    return this.http.post<CreateEventResponse>(url, event, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAll() {
    const url = `${environment.apiUrl}/events`;
    const token = localStorage.getItem("token");
    return this.http.get<GetEventsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }


}
