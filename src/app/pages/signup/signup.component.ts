import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

const MIN_LENGTH = 6;
@Component({
  standalone: false,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  isPassword = signal(true);
  isConfirmPassword = signal(true);
  signup_form: FormGroup;

  private form_builder = inject(FormBuilder);

  constructor() {
     this.signup_form = this.form_builder.group(
      {
        profile: [''],
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

  get emailControl() {
    return this.signup_form.controls["email"];
  }

  get passwordControl() {
    return this.signup_form.controls["password"];
  }

  get confirmPasswordControl() {
    return this.signup_form.controls["confirm_password"];
  }

  togglePasswordVisibility(event: MouseEvent) {
    this.isPassword.set(!this.isPassword());
    event.stopPropagation();
  }

  toggleConfirmPasswordVisibility(event: MouseEvent) {
    this.isConfirmPassword.set(!this.isConfirmPassword());
    event.stopPropagation();
  }

  changeProfile(event: any) {
    const file = event.target?.files[0];
    if (!file.type.startsWith("image")) return;
    

  }

  submit() {
    if (this.signup_form.invalid) return;
    
  }
}
