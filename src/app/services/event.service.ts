import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse, GetEventResponse, EventQuery, MyEventQuery } from '../models/Event';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  private browserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  create(event: Event) {
    const url = `${environment.apiUrl}/events`;
    const formData = new FormData();
    formData.append("cover", event.cover);
    formData.append("title", event.title);
    formData.append("description", event.description);
    formData.append("date", event.date);
    formData.append("start_time", event.start_time);
    formData.append("end_time", event.end_time);
    formData.append("timezone", this.browserTimezone());
    formData.append("category", event.category);
    formData.append("type", event.type);

    return this.http.post<CreateEventResponse>(url, formData);
  }

  getAll() {
    const url = `${environment.apiUrl}/events`;
    return this.http.get<GetEventsResponse>(url);
  }

  getMyEvents(query: MyEventQuery) {
    const url = `${environment.apiUrl}/events/own`;
    let params = new HttpParams();

    if (query) {
      if (query.type) {
        params = params.set("type", query.type);
      }
      if (query.limit) {
        params = params.set("limit", query.limit);
      }
      if (query.offset) {
        params = params.set("offset", query.offset);
      }
    }

    return this.http.get<GetEventsResponse>(url, { params });
  }

  getAllByQuery(query: EventQuery) {
    const url = `${environment.apiUrl}/events/events_by_query`;
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
      if (query.date) {
        params = params.set("date", query.date);
      }
      if (query.limit) {
        params = params.set("limit", query.limit);
      }
      if (query.offset) {
        params = params.set("offset", query.offset);
      }
    }

    return this.http.get<GetEventsResponse>(url, { params });
  }

  getOneById(id: string) {
    const url = `${environment.apiUrl}/events/${id}`;
    return this.http.get<GetEventResponse>(url);
  }

  update(id: string, event: Event) {
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
    formData.append("timezone", this.browserTimezone());
    formData.append("category", event.category);
    formData.append("type", event.type);
    return this.http.put<CreateEventResponse>(url, formData);
  }

  delete(id: string) {
    const url = `${environment.apiUrl}/events/${id}`;
    return this.http.delete<GeneralResponse>(url);
  }
}
