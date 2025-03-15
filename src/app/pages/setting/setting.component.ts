import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {
  @ViewChild("imgView") imgView: any;
  isPassword = signal(true);
  edit_profile_form: FormGroup;
  profile = "";

  private form_builder = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private commonService = inject(CommonService);

  constructor() {
    this.edit_profile_form = this.form_builder.group(
      {
        profile: [''],
        name: [''],
        email: [''],
      }
    );
  }

  ngOnInit() {
    this.userService.getCurrentUser().pipe(
      map(res => res.data)
    ).subscribe({
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

  togglePasswordVisibility() {
    this.isPassword.set(!this.isPassword());
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
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }
}
