import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateSessionResponse, GetSessionResponse, GetSessionsResponse, Session } from '../models/Session';
import { GeneralResponse } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);

  constructor() { }

  create(session: Session) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions`;
    return this.http.post<CreateSessionResponse>(url, session, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  getAll(event: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions`;
    return this.http.get<GetSessionsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        "event-id": event
      })
    });
  }

  getOneById(id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.get<GetSessionResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  update(id: string, session: Session) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.put<CreateSessionResponse>(url, session, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }

  delete(id: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.delete<GeneralResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
  
}
