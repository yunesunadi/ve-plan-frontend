import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { UserPayload } from '../../models/User';
import { CommonService } from '../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isPassword = signal(true);
  login_form: FormGroup;

  private form_builder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);

  constructor() {
    this.login_form = this.form_builder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get emailControl() {
    return this.login_form.controls["email"];
  }

  get passwordControl() {
    return this.login_form.controls["password"];
  }

  togglePasswordVisibility() {
    this.isPassword.set(!this.isPassword());
  }

  submit() {
    if (this.login_form.invalid) return;
    
    this.authService.login(this.login_form.value).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        localStorage.setItem("token", token);

        const decoded: UserPayload = jwtDecode(token);

        if (decoded.role === "organizer") {
          this.router.navigateByUrl("organizer/dashboard/home");
        }

        if (decoded.role === "attendee") {
          this.router.navigateByUrl("attendee/dashboard/home");
        }
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
            this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }
}
