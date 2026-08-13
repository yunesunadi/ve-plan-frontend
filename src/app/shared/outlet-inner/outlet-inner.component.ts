import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-outlet-inner',
  templateUrl: './outlet-inner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './outlet-inner.component.scss'
})
export class OutletInnerComponent {

}
