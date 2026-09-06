import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { Event, EventCategoryType, ParticipationState } from '../../../models/Event';
import { UtilService } from '../../../services/util.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { StatusChipComponent, StatusKind } from '../status-chip/status-chip.component';

interface CategoryMeta {
  label: string;
  icon: string;
}

const CATEGORY_META: Record<EventCategoryType, CategoryMeta> = {
  conference: { label: 'Conference', icon: 'groups' },
  meetup: { label: 'Meetup', icon: 'group_work' },
  webinar: { label: 'Webinar', icon: 'cast_for_education' },
};

const PARTICIPATION_STATUS: Record<Exclude<ParticipationState, 'none'>, StatusKind> = {
  registered: 'registered',
  registration_approved: 'register_approved',
  invited: 'invited',
  invitation_accepted: 'invitation_accepted',
};

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-card.component.scss',
  imports: [NgTemplateOutlet, RouterLink, MatIcon, AvatarComponent, StatusChipComponent],
})
export class EventCardComponent {
  private readonly utilService = inject(UtilService);

  event = input.required<Event>();
  link = input<string | any[] | null>(null);
  status = input<StatusKind | null>(null);
  density = input<'comfortable' | 'compact'>('comfortable');

  private readonly coverFailed = signal(false);

  protected readonly coverSrc = computed<string | null>(() => {
    const cover = this.event().cover;
    return cover ? `${environment.coverUrl}/${cover}` : null;
  });

  protected readonly showCover = computed(() => !!this.coverSrc() && !this.coverFailed());

  protected readonly categoryMeta = computed(() => CATEGORY_META[this.event().category]);

  protected readonly timeRange = computed(() => this.formatTimeRange(this.event()));

  protected readonly derivedStatus = computed<StatusKind | null>(() => {
    const explicit = this.status();
    if (explicit) return explicit;

    const state = this.event().participation?.state ?? 'none';
    if (state === 'none') {
      return this.utilService.is_event_expired(this.event()) ? 'past' : null;
    }
    return PARTICIPATION_STATUS[state];
  });

  constructor() {
    effect(() => {
      this.coverSrc();
      this.coverFailed.set(false);
    });
  }

  protected onCoverError(): void {
    this.coverFailed.set(true);
  }

  private formatTimeRange(event: Event): string {
    const [start, end] = event.starts_at && event.ends_at
      ? [new Date(event.starts_at), new Date(event.ends_at)]
      : this.legacyRange(event);

    const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
    const sameDay = start.toDateString() === end.toDateString();

    let range = sameDay
      ? `${dateFmt.format(start)}, ${timeFmt.format(start)} – ${timeFmt.format(end)}`
      : `${dateFmt.format(start)} ${timeFmt.format(start)} – ${dateFmt.format(end)} ${timeFmt.format(end)}`;

    const zone = event.timezone;
    if (zone && zone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
      range += ` (${zone})`;
    }

    return range;
  }

  private legacyRange(event: Event): [Date, Date] {
    const date = new Date(event.date);
    const combine = (time: string) => {
      const t = new Date(time);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.getHours(), t.getMinutes());
    };
    return [combine(event.start_time), combine(event.end_time)];
  }
}
