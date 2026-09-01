import { ChangeDetectorRef, Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix, MatHint } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';

const MIN_LENGTH = 6;

@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './setting.component.scss',
    imports: [OutletInnerComponent, MatButton, MatIcon, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatSuffix, MatHint, MatDivider]
})
export class SettingComponent {
  @ViewChild("imgView") imgView!: ElementRef;
  isCurrentPassword = signal(true);
  isNewPassword = signal(true);
  isConfirmPassword = signal(true);
  showChangePassword = signal(true);
  isDeletePassword = signal(true);
  isDeleting = signal(false);
  edit_profile_form: FormGroup;
  change_password_form: FormGroup;
  delete_account_form: FormGroup;
  profile = signal("");

  private form_builder = inject(FormBuilder);
  private userService = inject(UserService);
  private cacheService = inject(DashboardCacheService);
  private commonService = inject(CommonService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  location = inject(Location);

  constructor() {
    this.edit_profile_form = this.form_builder.group(
      {
        profile: [''],
        name: [''],
        email: [{ value: '', disabled: true }],
      }
    );

    this.change_password_form = this.form_builder.group(
      {
        current_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
        new_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
        confirm_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]]
      },
      {
        validators: this.checkPasswordsValidator()
      }
    );

    this.delete_account_form = this.form_builder.group(
      {
        password: ['', Validators.required],
      }
    );
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['new_password'] !== control.value['confirm_password'];
      return  isNotMatched ? { passwordsNotMatched: true } : null;
    };
  }

  emailMatchValidator(email: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value?.['confirm_email'] ?? '').trim().toLowerCase();
      if (!value) return null;
      return value === email.trim().toLowerCase() ? null : { emailMismatch: true };
    };
  }

  ngOnInit() {
    this.cacheService.current_user.subscribe({
      next: (user) => {
        if (user.profile) {
          if (user.googleId || user.facebookId) {
            this.profile.set(user.profile);
          } else {
            this.profile.set(environment.profileUrl + "/" + user.profile);
          }
        } else {
          this.profile.set("assets/images/placeholder_person.png");
        }

        const isSocialOnly = !!(user.googleId || user.facebookId) && !user.hasPassword;
        this.showChangePassword.set(!isSocialOnly);

        this.delete_account_form = isSocialOnly
          ? this.form_builder.group(
              { confirm_email: ['', Validators.required] },
              { validators: this.emailMatchValidator(user.email || '') }
            )
          : this.form_builder.group({ password: ['', Validators.required] });

        this.edit_profile_form = this.form_builder.group(
          {
            profile: [user.profile || ''],
            name: [user.name || '', Validators.required],
            email: [{ value: user.email || '', disabled: true }],
          }
        );

        this.changeDetectorRef.markForCheck();
      }
    });
  }

  get nameControl() {
    return this.edit_profile_form.controls["name"];
  }

  get currentPasswordControl() {
    return this.change_password_form.controls["current_password"];
  }

  get newPasswordControl() {
    return this.change_password_form.controls["new_password"];
  }

  get confirmPasswordControl() {
    return this.change_password_form.controls["confirm_password"];
  }

  get deletePasswordControl() {
    return this.delete_account_form.controls["password"];
  }

  get confirmEmailControl() {
    return this.delete_account_form.controls["confirm_email"];
  }

  toggleDeletePasswordVisibility() {
    this.isDeletePassword.update(prev => !prev);
  }

  toggleCurrentPasswordVisibility() {
    this.isCurrentPassword.update(prev => !prev);
  }

  toggleNewPasswordVisibility() {
    this.isNewPassword.update(prev => !prev);
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

      this.edit_profile_form.get("profile")?.patchValue(file);
    }
  }

  editProfile() {
    this.edit_profile_form.markAllAsTouched();

    if (this.edit_profile_form.invalid) return;
    
    this.userService.editProfile(this.edit_profile_form.value).subscribe({
      next: (res) => {
        this.commonService.openSnackBar(res.message);
        this.cacheService.resetCurrentUser();
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }

  changePassword() {
    this.change_password_form.markAllAsTouched();
    
    if (this.change_password_form.invalid) return;

    const current_password = this.change_password_form.value.current_password;
    const new_password = this.change_password_form.value.new_password;
    
    this.userService.updatePassword(current_password, new_password).subscribe({
      next: (res) => {
        this.commonService.openSnackBar(res.message);
        this.change_password_form.reset();
        this.currentPasswordControl.setErrors(null);
        this.newPasswordControl.setErrors(null);
        this.confirmPasswordControl.setErrors(null);
        this.cacheService.resetCurrentUser();
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }

  deleteAccount() {
    this.delete_account_form.markAllAsTouched();

    if (this.delete_account_form.invalid) return;

    const ok = confirm("Delete your account? This permanently removes your events, registrations, invitations and meeting history and cannot be undone.");

    if (!ok) return;

    const body = this.showChangePassword()
      ? { password: this.delete_account_form.value.password }
      : { confirm_email: this.delete_account_form.value.confirm_email };

    this.isDeleting.set(true);

    this.userService.deleteAccount(body).subscribe({
      next: (res) => {
        this.commonService.openSnackBar(res.message);
        localStorage.removeItem("token");
        this.router.navigateByUrl("login");
      },
      error: (err) => {
        this.isDeleting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }
}
