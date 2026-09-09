import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { filter, switchMap } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { ApiError } from '../../models/ApiError';
import { UserService } from '../../services/user.service';
import { EventService } from '../../services/event.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { SocketService } from '../../services/socket.service';
import { User } from '../../models/User';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatIconButton } from '@angular/material/button';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix, MatHint } from '@angular/material/input';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';
import { PasswordStrengthComponent } from '../../shared/ui/password-strength/password-strength.component';
import { ParentErrorStateMatcher } from '../../shared/parent-error-state-matcher';

const MIN_LENGTH = 8;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './setting.component.scss',
  imports: [
    OutletInnerComponent, PageHeaderComponent, AvatarComponent, RouterLink,
    ReactiveFormsModule, MatCard, MatCardContent,
    MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatButton, MatIcon, MatSuffix, MatHint,
    FormErrorComponent, SubmitButtonComponent, PasswordStrengthComponent,
  ],
})
export class SettingComponent {
  private form_builder = inject(FormBuilder);
  private userService = inject(UserService);
  private eventService = inject(EventService);
  private cacheService = inject(DashboardCacheService);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private socketService = inject(SocketService);
  private router = inject(Router);

  readonly PHOTO_HINT = 'JPG, PNG or WebP · up to 5 MB';

  isCurrentPassword = signal(true);
  isNewPassword = signal(true);
  isConfirmPassword = signal(true);
  isDeletePassword = signal(true);
  showChangePassword = signal(true);

  isSavingProfile = signal(false);
  isChangingPassword = signal(false);
  isDeleting = signal(false);

  newPasswordValue = signal('');

  currentUser = signal<User | null>(null);
  currentUserEmail = signal('');
  uploadProgress = signal<number | null>(null);

  stagedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  photoError = signal('');

  liveMeeting = signal<{ event_id: string; title: string | null } | null>(null);
  ownedEventsCount = signal<number | null>(null);

  readonly isOrganizer = computed(() => this.currentUser()?.role === 'organizer');
  readonly socialProvider = computed(() => {
    const u = this.currentUser();
    if (u?.googleId) return 'Google';
    if (u?.facebookId) return 'Facebook';
    return null;
  });

  edit_profile_form: FormGroup;
  change_password_form: FormGroup;
  delete_account_form: FormGroup;
  confirmPasswordMatcher = new ParentErrorStateMatcher();

  constructor() {
    this.edit_profile_form = this.form_builder.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
    });

    this.change_password_form = this.form_builder.group(
      {
        current_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
        confirm_password: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
      },
      { validators: this.checkPasswordsValidator() },
    );

    this.change_password_form.controls['new_password'].valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.newPasswordValue.set(value ?? ''));

    this.delete_account_form = this.form_builder.group({
      password: ['', Validators.required],
    });
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['new_password'] !== control.value['confirm_password'];
      return isNotMatched ? { passwordMismatch: true } : null;
    };
  }

  ngOnInit() {
    this.cacheService.current_user.subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.currentUserEmail.set(user.email || '');

        const isSocialOnly = !!(user.googleId || user.facebookId) && !user.hasPassword;
        this.showChangePassword.set(!isSocialOnly);

        this.delete_account_form = isSocialOnly
          ? this.form_builder.group({})
          : this.form_builder.group({ password: ['', Validators.required] });

        this.edit_profile_form.patchValue({ name: user.name || '', email: user.email || '' });

        if (user.role === 'organizer') {
          this.loadOrganizerContext();
        }
      },
    });
  }

  private loadOrganizerContext(): void {
    this.eventService.getOrganizerSummary().subscribe({
      next: (res) => this.liveMeeting.set(res.data.live_meeting),
    });
    this.eventService.getMyEvents({ type: 'all', limit: 1 }).subscribe({
      next: (res) => this.ownedEventsCount.set(res.meta?.total ?? 0),
    });
  }

  get nameControl() { return this.edit_profile_form.controls['name']; }
  get currentPasswordControl() { return this.change_password_form.controls['current_password']; }
  get newPasswordControl() { return this.change_password_form.controls['new_password']; }
  get confirmPasswordControl() { return this.change_password_form.controls['confirm_password']; }
  get deletePasswordControl() { return this.delete_account_form.controls['password']; }

  toggleDeletePasswordVisibility() { this.isDeletePassword.update((p) => !p); }
  toggleCurrentPasswordVisibility() { this.isCurrentPassword.update((p) => !p); }
  toggleNewPasswordVisibility() { this.isNewPassword.update((p) => !p); }
  toggleConfirmPasswordVisibility() { this.isConfirmPassword.update((p) => !p); }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.photoError.set('');

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      this.photoError.set('That file type is not supported. Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      this.photoError.set('That image is larger than 5 MB. Choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
    this.stagedFile.set(file);
  }

  clearStagedPhoto(): void {
    this.stagedFile.set(null);
    this.previewUrl.set(null);
    this.photoError.set('');
  }

  editProfile(): void {
    this.edit_profile_form.markAllAsTouched();
    if (this.edit_profile_form.invalid) return;

    this.isSavingProfile.set(true);
    this.uploadProgress.set(this.stagedFile() ? 0 : null);

    this.userService.editProfile({
      profile: this.stagedFile(),
      name: this.edit_profile_form.getRawValue().name,
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          this.isSavingProfile.set(false);
          this.uploadProgress.set(null);
          this.clearStagedPhoto();
          this.commonService.success(event.body?.message ?? 'Profile updated.');
          this.cacheService.resetCurrentUser();
        }
      },
      error: (err: unknown) => {
        this.isSavingProfile.set(false);
        this.uploadProgress.set(null);
        this.photoError.set(this.stagedFile() ? 'Upload failed. Please try again.' : '');
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  changePassword(): void {
    this.change_password_form.markAllAsTouched();
    if (this.change_password_form.invalid) return;

    const { current_password, new_password } = this.change_password_form.value;

    this.isChangingPassword.set(true);
    this.userService.updatePassword(current_password, new_password).subscribe({
      next: (res) => {
        this.isChangingPassword.set(false);
        localStorage.setItem('token', res.token);
        this.socketService.connect(res.token);
        this.commonService.success(res.message);
        this.change_password_form.reset();
        this.currentPasswordControl.setErrors(null);
        this.newPasswordControl.setErrors(null);
        this.confirmPasswordControl.setErrors(null);
        this.cacheService.resetCurrentUser();
      },
      error: (err: unknown) => {
        this.isChangingPassword.set(false);
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  deleteAccount(): void {
    this.delete_account_form.markAllAsTouched();
    if (this.delete_account_form.invalid) return;

    const live = this.liveMeeting();
    if (live) {
      this.commonService.warning(
        `End your live meeting${live.title ? ` for “${live.title}”` : ''} before deleting your account.`,
      );
      return;
    }

    const isSocialOnly = !this.showChangePassword();
    const email = this.currentUserEmail();
    const count = this.ownedEventsCount();

    const eventsClause = this.isOrganizer() && count !== null
      ? ` This removes ${count} event${count === 1 ? '' : 's'} you own and everything in ${count === 1 ? 'it' : 'them'}.`
      : '';

    this.confirmService.confirm({
      title: 'Delete your account?',
      body: `This permanently removes your registrations, invitations and meeting history and cannot be undone.${eventsClause}`,
      confirmLabel: 'Delete account',
      destructive: true,
      confirmationPhrase: email,
      confirmationHint: 'Type your account email to confirm',
    }).pipe(
      filter(Boolean),
      switchMap(() => {
        this.isDeleting.set(true);
        const body = isSocialOnly
          ? { confirm_email: email }
          : { password: this.delete_account_form.value.password };
        return this.userService.deleteAccount(body);
      }),
    ).subscribe({
      next: (res) => {
        this.commonService.success(res.message);
        localStorage.removeItem('token');
        this.router.navigateByUrl('login');
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }
}
