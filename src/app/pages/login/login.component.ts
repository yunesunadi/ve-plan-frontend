import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';

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
        this.router.navigateByUrl("dashboard/home");
      },
      error: (err) => {
        console.log("err", err);
      }
    });
  }
}
