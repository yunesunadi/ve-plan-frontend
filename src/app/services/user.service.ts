import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeneralResponse, Response } from '../models/Utils';
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

  getAttendees(keyword: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user/attendees`;
    const params = new HttpParams().append("search", keyword);
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

  editProfile(data: { profile: string; name: string; email: string; }) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/user`;
    const formData = new FormData();
    formData.append("profile", data.profile || "");
    formData.append("name", data.name);
    formData.append("email", data.email);

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
}
