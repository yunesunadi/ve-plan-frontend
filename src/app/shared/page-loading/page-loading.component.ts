import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-page-loading',
  templateUrl: './page-loading.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './page-loading.component.scss'
})
export class PageLoadingComponent {

}
