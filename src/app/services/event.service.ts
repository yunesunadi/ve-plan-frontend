import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse, GetEventResponse } from '../models/Event';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private token = localStorage.getItem("token");

  create(event: Event) {
    const url = `${environment.apiUrl}/events`;
    return this.http.post<CreateEventResponse>(url, event, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      })
    });
  }

  getAll() {
    const url = `${environment.apiUrl}/events`;
    return this.http.get<GetEventsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      })
    });
  }

  getOneById(id: string) {
    const url = `${environment.apiUrl}/events/${id}`;
    return this.http.get<GetEventResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      })
    });
  }

}
