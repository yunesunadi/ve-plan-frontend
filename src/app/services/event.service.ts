import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, CreateEventResponse, GetEventsResponse, GetEventResponse } from '../models/Event';
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
