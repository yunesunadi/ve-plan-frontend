import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export type StatusKind =
  | 'registered' | 'register_approved' | 'invited' | 'invitation_accepted'
  | 'meeting_live' | 'meeting_ended' | 'meeting_scheduled' | 'meeting_not_started'
  | 'public' | 'private'
  | 'upcoming' | 'happening' | 'past';

export type StatusTone = 'success' | 'warning' | 'info' | 'neutral';
export type StatusVariant = 'filled' | 'outlined';

export const STATUS_META: Record<StatusKind, { label: string; icon: string; tone: StatusTone }> = {
  registered: { label: 'Registered', icon: 'how_to_reg', tone: 'info' },
  register_approved: { label: 'Approved', icon: 'done_all', tone: 'success' },
  invited: { label: 'Invited', icon: 'mail_outline', tone: 'warning' },
  invitation_accepted: { label: 'Accepted', icon: 'done_all', tone: 'success' },
  meeting_live: { label: 'Live now', icon: 'sensors', tone: 'success' },
  meeting_ended: { label: 'Ended', icon: 'stop_circle', tone: 'neutral' },
  meeting_scheduled: { label: 'Scheduled', icon: 'schedule', tone: 'info' },
  meeting_not_started: { label: 'Not started', icon: 'videocam_off', tone: 'neutral' },
  public: { label: 'Public', icon: 'public', tone: 'info' },
  private: { label: 'Private', icon: 'lock', tone: 'neutral' },
  upcoming: { label: 'Upcoming', icon: 'schedule', tone: 'info' },
  happening: { label: 'Happening now', icon: 'sensors', tone: 'success' },
  past: { label: 'Past', icon: 'history', tone: 'neutral' },
};

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './status-chip.component.scss',
  imports: [MatIcon],
})
export class StatusChipComponent {
  status = input.required<StatusKind>();
  variant = input<StatusVariant>('filled');
  dense = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly meta = computed(() => STATUS_META[this.status()]);

  protected readonly cssClass = computed(() => {
    const classes = ['status-chip', `status-chip--${this.meta().tone}`];
    if (this.variant() === 'outlined') classes.push('status-chip--outlined');
    if (this.dense()) classes.push('status-chip--dense');
    return classes.join(' ');
  });
}
