import { Component, computed, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Event, EventCategoryType } from '../../models/Event';
import { environment } from '../../../environments/environment';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { UtilService } from '../../services/util.service';

const CATEGORY_ICON: Record<EventCategoryType, string> = {
  conference: 'groups',
  meetup: 'group_work',
  webinar: 'cast_for_education',
};

@Component({
  selector: 'app-event-details-card',
  templateUrl: './event-details-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-details-card.component.scss',
  imports: [MatCard, MatCardContent, MatIcon],
})
export class EventDetailsCardComponent {
  private readonly util = inject(UtilService);

  event = input.required<Event>();

  private readonly coverFailed = signal(false);

  protected readonly coverSrc = computed(() => {
    const cover = this.event().cover;
    return cover ? `${environment.coverUrl}/${cover}` : null;
  });

  protected readonly showCover = computed(() => !!this.coverSrc() && !this.coverFailed());

  protected readonly categoryIcon = computed(() => CATEGORY_ICON[this.event().category]);

  protected readonly schedule = computed(() => this.util.formatEventSchedule(this.event()));

  constructor() {
    effect(() => {
      this.coverSrc();
      this.coverFailed.set(false);
    });
  }

  protected onCoverError(): void {
    this.coverFailed.set(true);
  }
}
