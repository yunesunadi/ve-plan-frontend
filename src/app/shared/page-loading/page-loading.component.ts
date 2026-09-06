import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-page-loading',
    templateUrl: './page-loading.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './page-loading.component.scss',
    imports: [MatProgressSpinner]
})
export class PageLoadingComponent {
    label = input<string>('Loading…');
}
