import { Component, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';

const MIN_LENGTH = 6;

@Component({
  standalone: false,
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {
  @ViewChild("imgView") imgView: any;
  isCurrentPassword = signal(true);
  isNewPassword = signal(true);
  isConfirmPassword = signal(true);
  edit_profile_form: FormGroup;
  change_password_form: FormGroup;
  profile = "";

  private form_builder = inject(FormBuilder);
  private userService = inject(UserService);
  private cacheService = inject(DashboardCacheService);
  private commonService = inject(CommonService);
  location = inject(Location);

  constructor() {
    this.edit_profile_form = this.form_builder.group(
      {
        profile: [''],
        name: [''],
        email: [''],
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
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['new_password'] !== control.value['confirm_password'];
      return  isNotMatched ? { passwordsNotMatched: true } : null;
    };
  }

  ngOnInit() {
    this.cacheService.current_user.subscribe({
      next: (user) => {
        if (user.profile) {
          this.profile = environment.profileUrl + "/" + user.profile;
        } else {
          this.profile = "assets/images/placeholder_person.png";
        }

        this.edit_profile_form = this.form_builder.group(
          {
            profile: [user.profile || ''],
            name: [user.name || '', Validators.required],
            email: [user.email || '', [Validators.required, Validators.email]],
          }
        );
      }
    });
  }

  get nameControl() {
    return this.edit_profile_form.controls["name"];
  }

  get emailControl() {
    return this.edit_profile_form.controls["email"];
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

  toggleCurrentPasswordVisibility() {
    this.isCurrentPassword.set(!this.isCurrentPassword());
  }

  toggleNewPasswordVisibility() {
    this.isNewPassword.set(!this.isNewPassword());
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

      this.edit_profile_form.get("profile")?.patchValue(file);
    }
  }

  editProfile() {
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
}
