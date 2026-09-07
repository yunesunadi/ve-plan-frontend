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

  time_ago(value: string | Date): string {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '';

    const diffSec = Math.round((Date.now() - then) / 1000);
    if (diffSec < 45) return 'just now';

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'short' });
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return rtf.format(-diffMin, 'minute');

    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 24) return rtf.format(-diffHour, 'hour');

    const diffDay = Math.round(diffHour / 24);
    if (diffDay < 7) return rtf.format(-diffDay, 'day');

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(then);
  }

  formatEventSchedule(event: {
    timezone?: string;
    starts_at?: string;
    ends_at?: string;
    date: string;
    start_time: string;
    end_time: string;
  }): { date: string; time: string; zone: string | null } {
    const zone = event.timezone || null;
    const [start, end] = event.starts_at && event.ends_at
      ? [new Date(event.starts_at), new Date(event.ends_at)]
      : [
          this.legacyDateTime(event.date, event.start_time),
          this.legacyDateTime(event.date, event.end_time),
        ];

    const zoneOpt = zone ? { timeZone: zone } : {};
    const dateFmt = new Intl.DateTimeFormat(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', ...zoneOpt,
    });
    const timeFmt = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric', minute: '2-digit', ...zoneOpt,
    });

    const sameDay = dateFmt.format(start) === dateFmt.format(end);

    return {
      date: sameDay ? dateFmt.format(start) : `${dateFmt.format(start)} – ${dateFmt.format(end)}`,
      time: `${timeFmt.format(start)} – ${timeFmt.format(end)}`,
      zone,
    };
  }

  private legacyDateTime(date: string, time: string): Date {
    const d = new Date(date);
    const t = new Date(time);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes());
  }

  joinWindowState(event: {
    timezone?: string; starts_at?: string; ends_at?: string;
    date: string; start_time: string; end_time: string;
  }, now: number = Date.now()): { state: 'early' | 'open' | 'closed'; opensAt: number; closesAt: number } {
    const start = event.starts_at
      ? new Date(event.starts_at)
      : this.legacyDateTime(event.date, event.start_time);
    const end = event.ends_at
      ? new Date(event.ends_at)
      : this.legacyDateTime(event.date, event.end_time);

    const opensAt = start.getTime() - 15 * 60_000;
    const closesAt = end.getTime() + 30 * 60_000;

    let state: 'early' | 'open' | 'closed' = 'open';
    if (now < opensAt) state = 'early';
    else if (now > closesAt) state = 'closed';

    return { state, opensAt, closesAt };
  }
}
