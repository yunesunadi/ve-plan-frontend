import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse, GetEventResponse } from '../models/Event';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  create(event: Event) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events`;
    return this.http.post<CreateEventResponse>(url, event, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAll() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events`;
    return this.http.get<GetEventsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getOneById(id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events/${id}`;
    return this.http.get<GetEventResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

}
