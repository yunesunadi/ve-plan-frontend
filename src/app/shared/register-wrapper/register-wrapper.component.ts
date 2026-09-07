import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-register-wrapper',
    templateUrl: './register-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './register-wrapper.component.scss',
    imports: [RouterLink, MatIcon]
})
export class RegisterWrapperComponent {

}
