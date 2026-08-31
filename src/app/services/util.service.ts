import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  is_event_expired(event: { ends_at?: string | null; date: string; end_time: string }) {
    if (event.ends_at) {
      return new Date(event.ends_at).getTime() < Date.now();
    }

    const date = new Date(event.date);
    const time = new Date(event.end_time);

    const event_datetime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds()
    ).getTime();

    return event_datetime < Date.now();
  }
}
