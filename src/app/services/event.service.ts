import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse, GetEventResponse, EventQuery } from '../models/Event';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  create(event: Event) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events`;
    const formData = new FormData();
    formData.append("cover", event.cover);
    formData.append("title", event.title);
    formData.append("description", event.description);
    formData.append("date", event.date);
    formData.append("start_time", event.start_time);
    formData.append("end_time", event.end_time);
    formData.append("category", event.category);
    formData.append("type", event.type);

    return this.http.post<CreateEventResponse>(url, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAll(query?: EventQuery) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events`;
    let params = new HttpParams();

    if (query) {
      if (query.search_value) {
        params = params.set("search_value", query.search_value);
      }
      if (query.time) {
        params = params.set("time", query.time);
      }
      if (query.category) {
        params = params.set("category", query.category);
      }
    }

    return this.http.get<GetEventsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
      params
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

  update(id: string, event: Event) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events/${id}`;
    const formData = new FormData();
    if (event.cover) {
      formData.append("cover", event.cover);
    }
    formData.append("title", event.title);
    formData.append("description", event.description);
    formData.append("date", event.date);
    formData.append("start_time", event.start_time);
    formData.append("end_time", event.end_time);
    formData.append("category", event.category);
    formData.append("type", event.type);
    return this.http.put<CreateEventResponse>(url, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
  
  delete(id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/events/${id}`;
    return this.http.delete<GeneralResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
}
