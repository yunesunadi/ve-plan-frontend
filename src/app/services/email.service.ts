import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);

  constructor() { }

  send(action: string, recipient: string, name: string, event_title: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/emails`;
    return this.http.post<GeneralResponse>(
      url,
      {
        action,
        recipient: recipient,
        additional: {
          name,
          event_title,
        }
      },
      {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
}
