import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../models/ApiError';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

const MIN_LENGTH = 8;

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function scorePassword(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: '' };

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const clamped = Math.min(4, score) as PasswordStrength['score'];
  return { score: clamped, label: STRENGTH_LABELS[clamped] };
}

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './signup.component.scss',
    imports: [
        RegisterWrapperComponent,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatIconButton,
        MatSuffix,
        MatIcon,
        RouterLink,
        FormErrorComponent,
        SubmitButtonComponent,
    ],
})
export class SignupComponent {
  @ViewChild("imgView") imgView!: ElementRef;
  isPassword = signal(true);
  isConfirmPassword = signal(true);
  submitting = signal(false);
  formError = signal<string | null>(null);
  passwordStrength = signal<PasswordStrength>({ score: 0, label: '' });
  signup_form: FormGroup;

  private form_builder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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

    this.passwordControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value: string) => this.passwordStrength.set(scorePassword(value ?? '')));
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['password'] !== control.value['confirm_password'];
      return  isNotMatched ? { passwordMismatch: true } : null;
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
    this.isPassword.update(prev => !prev);
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPassword.update(prev => !prev);
  }

  changeProfile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    
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
    this.formError.set(null);

    if (this.signup_form.invalid) return;
    delete this.signup_form.value['confirm_password'];

    const email = this.signup_form.value['email'];

    this.submitting.set(true);
    this.authService.register(this.signup_form.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(["verify_email"], { queryParams: { email } });
      },
      error: (err) => {
        this.submitting.set(false);
        this.formError.set(err instanceof ApiError && err.message ? err.message : "We couldn't create your account. Please try again.");
      }
    });
  }
}
