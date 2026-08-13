import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-page-loading',
    templateUrl: './page-loading.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './page-loading.component.scss',
    imports: [MatProgressSpinner]
})
export class PageLoadingComponent {

}
