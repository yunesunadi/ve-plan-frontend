import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-outlet-inner',
    templateUrl: './outlet-inner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './outlet-inner.component.scss'
})
export class OutletInnerComponent {

}
