import { HttpClient } from '@angular/common/http';
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
    const url = `${environment.apiUrl}/sessions`;
    return this.http.post<CreateSessionResponse>(url, session);
  }

  getAll(event: string) {
    const url = `${environment.apiUrl}/sessions`;
    return this.http.get<GetSessionsResponse>(url, {
      headers: { "event-id": event }
    });
  }

  getOneById(id: string) {
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.get<GetSessionResponse>(url);
  }

  update(id: string, session: Session) {
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.put<CreateSessionResponse>(url, session);
  }

  delete(id: string) {
    const url = `${environment.apiUrl}/sessions/${id}`;
    return this.http.delete<GeneralResponse>(url);
  }

}
