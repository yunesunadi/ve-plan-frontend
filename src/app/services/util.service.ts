import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  is_event_expired(event_date: string, event_time: string) {
    const date = new Date(event_date);
    const time = new Date(event_time);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const milliseconds = time.getMilliseconds();

    const event_datetime = new Date(year, month, day, hours, minutes, seconds, milliseconds).getTime();
    const current_datetime = new Date().getTime();

    if (event_datetime < current_datetime) {
      return true;
    }

    return false;
  }
}
