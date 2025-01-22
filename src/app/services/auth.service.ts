import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneralResponse, Response } from '../models/Utils';
import { SignUpData } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private token = localStorage.getItem("token");

  register(data: SignUpData) {
    const url = `${environment.apiUrl}/auth/register`;
    const formData = new FormData();
    formData.append("profile", data.profile || "");
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    return this.http.post<Response<"token", string>>(url, formData);
  }

  setRole(role: string) {
    const url = `${environment.apiUrl}/auth/role`;
    return this.http.post<GeneralResponse>(
      url,
      { role },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        })
      }
    );
  }

  isLoggedIn() {
    if (!this.token) return false;
    return true;
  }

  login(data: { email: string; password: string; }) {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<Response<"token", string>>(url, data);
  }
}
