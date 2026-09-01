import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, Response } from '../models/Utils';
import { GetNotificationsResponse } from '../models/Notification';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  markAsRead$ = new BehaviorSubject(null);

  constructor() { }

  getNotifications(offset = 0, limit = 20) {
    const url = `${environment.apiUrl}/notifications`;
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<GetNotificationsResponse>(url, { params });
  }

  getNotificationsCount() {
    const url = `${environment.apiUrl}/notifications/unread_count`;
    return this.http.get<GeneralResponse & Response<"unreadCount", number>>(url);
  }

  markAsRead(notification_id_list: string[]) {
    const url = `${environment.apiUrl}/notifications/mark_as_read`;
    return this.http.post(url, { notification_id_list });
  }

  markAllRead() {
    const url = `${environment.apiUrl}/notifications/mark_all_read`;
    return this.http.post(url, {});
  }

  deleteNotifications(notification_id_list: string[]) {
    const url = `${environment.apiUrl}/notifications`;
    return this.http.delete(url, { body: { notification_id_list } });
  }
}
