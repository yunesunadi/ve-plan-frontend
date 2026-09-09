import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmailRetryResponse, EmailStatusResponse, EventEmailAction } from '../models/Email';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);

  constructor() { }

  getStatus(eventId: string, action?: EventEmailAction): Observable<EmailStatusResponse> {
    const url = `${environment.apiUrl}/events/${eventId}/email_status`;
    const params = action ? new HttpParams().set('action', action) : undefined;
    return this.http.get<EmailStatusResponse>(url, { params });
  }

  retry(eventId: string, action?: EventEmailAction): Observable<EmailRetryResponse> {
    const url = `${environment.apiUrl}/events/${eventId}/email_retry`;
    return this.http.post<EmailRetryResponse>(url, action ? { action } : {});
  }
}
