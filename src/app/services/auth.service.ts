import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GeneralResponse, Response } from '../models/Utils';
import { RoleType, SignUpData, UserPayload } from '../models/User';

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
    const url = `${environment.apiUrl}/auth/role`;
    return this.http.post<Response<"token", string>>(url, { role });
  }

  isLoggedIn() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    return true;
  }

  role(): RoleType | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return jwtDecode<UserPayload>(token).role ?? null;
    } catch {
      return null;
    }
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

  resendVerification(email: string) {
    const url = `${environment.apiUrl}/auth/resend_verification`;
    return this.http.post<GeneralResponse>(url, { email });
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
