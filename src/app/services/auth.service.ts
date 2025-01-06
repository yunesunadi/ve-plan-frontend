import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '../models/Utils';

interface SignUpData {
  profile: File;
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  register(data: SignUpData) {
    const url = `${environment.apiUrl}/auth/register`;
    const formData = new FormData();
    formData.append("profile", data.profile);
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    return this.http.post<Response<"token", string>>(url, formData);
  }
}
