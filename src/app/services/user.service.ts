import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Response } from '../models/Utils';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  hasRole() {
    const url = `${environment.apiUrl}/user/has_role`;
    const token = localStorage.getItem("token") || "";
    return this.http.get<Response<"has_role", boolean>>(
      url,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }
}
