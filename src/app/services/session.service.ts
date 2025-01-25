import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateSessionResponse, GetSessionsResponse, Session } from '../models/Session';

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

  getAll() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/sessions`;
    return this.http.get<GetSessionsResponse>(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
  
}
