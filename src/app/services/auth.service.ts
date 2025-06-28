import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GeneralResponse, Response } from '../models/Utils';
import { SignUpData } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  register(data: SignUpData) {
    const url = `${environment.apiUrl}/auth/register`;
    const formData = new FormData();
    formData.append("profile", data.profile || "");
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    return this.http.post<GeneralResponse>(url, formData);
  }

  setRole(role: string) {
    const token = localStorage.getItem("token");
    const url = `${environment.apiUrl}/auth/role`;
    return this.http.post<GeneralResponse>(
      url,
      { role },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  isLoggedIn() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    return true;
  }

  login(data: { email: string; password: string; }) {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<Response<"token", string>>(url, data);
  }

  verifyEmail(token: string) {
    const url = `${environment.apiUrl}/auth/verify_email`;
    let params = new HttpParams();
    params = params.set("token", token);
    return this.http.post<Response<"token", string>>(url, {}, { params });
  }

  forgotPassword(email: string) {
    const url = `${environment.apiUrl}/auth/forgot_password`;
    return this.http.post<GeneralResponse>(url, { email });
  }

  resetPassword(token: string, password: string) {
    const url = `${environment.apiUrl}/auth/reset_password`;
    let params = new HttpParams();
    params = params.set("token", token);
    return this.http.post<GeneralResponse>(url, { password }, { params });
  }
  
}
