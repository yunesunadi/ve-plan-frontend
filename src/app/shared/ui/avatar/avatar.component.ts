import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/User';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './avatar.component.scss',
  imports: [],
})
export class AvatarComponent {
  user = input.required<Pick<User, 'name' | 'profile' | 'googleId' | 'facebookId'> | null>();
  size = input<AvatarSize>('md');

  private readonly imageFailed = signal(false);

  protected readonly imageUrl = computed<string | null>(() => {
    const currentUser = this.user();
    if (!currentUser?.profile) return null;
    if (currentUser.googleId || currentUser.facebookId) return currentUser.profile;
    return `${environment.profileUrl}/${currentUser.profile}`;
  });

  protected readonly showImage = computed(() => !!this.imageUrl() && !this.imageFailed());

  protected readonly initials = computed(() => {
    const name = this.user()?.name?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  });

  protected readonly altText = computed(() => {
    const name = this.user()?.name;
    return name ? `${name}'s profile photo` : 'Profile photo';
  });

  constructor() {
    effect(() => {
      this.imageUrl();
      this.imageFailed.set(false);
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
