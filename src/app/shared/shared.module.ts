import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterWrapperComponent } from './register-wrapper/register-wrapper.component';
import { MatButtonModule } from '@angular/material/button';
import { OutletInnerComponent } from './outlet-inner/outlet-inner.component';

@NgModule({
  declarations: [
    RegisterWrapperComponent,
    OutletInnerComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [
    RegisterWrapperComponent,
    OutletInnerComponent,
  ]
})
export class SharedModule { }
