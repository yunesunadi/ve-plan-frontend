import { Component, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';

const MIN_LENGTH = 6;
@Component({
  standalone: false,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  @ViewChild("imgView") imgView: any;
  isPassword = signal(true);
  isConfirmPassword = signal(true);
  signup_form: FormGroup;

  private form_builder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);

  constructor() {
     this.signup_form = this.form_builder.group(
      {
        profile: [''],
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
        confirm_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]]
      },
      {
        validators: this.checkPasswordsValidator()
      }
    );
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['password'] !== control.value['confirm_password'];
      return  isNotMatched ? { passwordsNotMatched: true } : null;
    };
  }

  get nameControl() {
    return this.signup_form.controls["name"];
  }

  get emailControl() {
    return this.signup_form.controls["email"];
  }

  get passwordControl() {
    return this.signup_form.controls["password"];
  }

  get confirmPasswordControl() {
    return this.signup_form.controls["confirm_password"];
  }

  togglePasswordVisibility() {
    this.isPassword.set(!this.isPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPassword.set(!this.isConfirmPassword());
  }

  changeProfile(event: any) {
    const file = event.target?.files[0];
    
    if (file) {
      if (!file.type.startsWith("image")) return;

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        this.imgView.nativeElement.src = event.target?.result;
      }
      fileReader.readAsDataURL(file);

      this.signup_form.get("profile")?.patchValue(file);
    }
  }

  submit() {
    this.signup_form.markAllAsTouched();

    if (this.signup_form.invalid) return;
    delete this.signup_form.value['confirm_password'];
    
    this.authService.register(this.signup_form.value).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        localStorage.setItem("token", token);
        this.router.navigateByUrl("role");
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }
}
