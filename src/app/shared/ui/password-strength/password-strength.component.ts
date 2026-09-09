import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export function scorePassword(pw: string): PasswordStrength {
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
  selector: 'app-password-strength',
  templateUrl: './password-strength.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './password-strength.component.scss',
  imports: [],
})
export class PasswordStrengthComponent {
  password = input<string | null | undefined>('');

  protected readonly bars = [1, 2, 3, 4];
  protected readonly strength = computed(() => scorePassword(this.password() ?? ''));
}
