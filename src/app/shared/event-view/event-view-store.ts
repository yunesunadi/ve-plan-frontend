import { Injectable, signal } from '@angular/core';
import { Event } from '../../models/Event';

@Injectable()
export class EventViewStore {
  readonly event = signal<Event | null>(null);

  readonly canManage = signal(false);

  setEvent(event: Event): void {
    this.event.set(event);
  }

  setCanManage(canManage: boolean): void {
    this.canManage.set(canManage);
  }
}
