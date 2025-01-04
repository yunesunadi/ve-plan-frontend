import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterWrapperComponent } from './register-wrapper/register-wrapper.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [RegisterWrapperComponent],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [
    RegisterWrapperComponent
  ]
})
export class SharedModule { }
