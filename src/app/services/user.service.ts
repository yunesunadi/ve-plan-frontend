import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse } from '../models/Utils';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  hasRole() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user/has_role`;
    return this.http.get<GeneralResponse & { has_role: boolean; role: "organizer" | "attendee"; }>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  getAttendees(keyword: string, page = 1) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user/attendees`;
    const params = new HttpParams()
      .append("search", keyword)
      .append("page", String(page));
    return this.http.get<GeneralResponse & { data: User[] }>(
      url,
      {
        params,
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }  

  getCurrentUser() {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user`;
    return this.http.get<GeneralResponse & { data: User }>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  editProfile(data: { profile: string; name: string; }) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user`;
    const formData = new FormData();
    formData.append("profile", data.profile || "");
    formData.append("name", data.name);

    return this.http.put<GeneralResponse>(
      url,
      formData,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  deleteAccount(body: { password?: string; confirm_email?: string }) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user`;
    return this.http.delete<GeneralResponse>(url, {
      body,
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  updatePassword(current_password: string, new_password: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user/password`;
    return this.http.put<GeneralResponse>(url, 
      {
        current_password,
        new_password
      },
      {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    });
  }
}
