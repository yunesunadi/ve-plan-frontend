import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  standalone: false,
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value: string) {
    return format(value, "dd/MM/yyyy");
  }

}
