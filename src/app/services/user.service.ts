import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, PageMeta } from '../models/Utils';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  hasRole() {
    const url = `${environment.apiUrl}/user/has_role`;
    return this.http.get<GeneralResponse & { has_role: boolean; role: "organizer" | "attendee"; }>(url);
  }

  getAttendees(keyword: string, offset = 0, limit = 20) {
    const url = `${environment.apiUrl}/user/attendees`;
    const params = new HttpParams()
      .append("search", keyword)
      .append("offset", String(offset))
      .append("limit", String(limit));
    return this.http.get<GeneralResponse & { data: User[]; meta: PageMeta }>(url, { params });
  }

  getCurrentUser() {
    const url = `${environment.apiUrl}/user`;
    return this.http.get<GeneralResponse & { data: User }>(url);
  }

  editProfile(data: { profile: File | string | null; name: string; }) {
    const url = `${environment.apiUrl}/user`;
    const formData = new FormData();
    formData.append("profile", data.profile ?? "");
    formData.append("name", data.name);

    return this.http.put<GeneralResponse>(url, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  deleteAccount(body: { password?: string; confirm_email?: string }) {
    const url = `${environment.apiUrl}/user`;
    return this.http.delete<GeneralResponse>(url, { body });
  }

  updatePassword(current_password: string, new_password: string) {
    const url = `${environment.apiUrl}/user/password`;
    return this.http.put<GeneralResponse & { token: string }>(url, {
      current_password,
      new_password
    });
  }
}
