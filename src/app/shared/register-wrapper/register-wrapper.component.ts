import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../ui/brand-logo/brand-logo.component';

@Component({
    selector: 'app-register-wrapper',
    templateUrl: './register-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './register-wrapper.component.scss',
    imports: [RouterLink, BrandLogoComponent]
})
export class RegisterWrapperComponent {

}
