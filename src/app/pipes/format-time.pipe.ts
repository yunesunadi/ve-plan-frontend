import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  standalone: false,
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(value: string) {
    return format(value, "hh:mm a");;
  }

}
