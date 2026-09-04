import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmailRetryResponse, EmailStatusResponse } from '../models/Email';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);

  constructor() { }

  getStatus(eventId: string): Observable<EmailStatusResponse> {
    const url = `${environment.apiUrl}/events/${eventId}/email_status`;
    return this.http.get<EmailStatusResponse>(url);
  }

  retry(eventId: string): Observable<EmailRetryResponse> {
    const url = `${environment.apiUrl}/events/${eventId}/email_retry`;
    return this.http.post<EmailRetryResponse>(url, {});
  }
}
