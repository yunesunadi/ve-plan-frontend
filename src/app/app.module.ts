import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { appConfig } from './app.config';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoleComponent } from './pages/role/role.component';
import { MatSelectModule } from '@angular/material/select';
import { PrivateComponent } from './layouts/private/private.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { notFoundInterceptor } from './interceptors/not-found.interceptor';
import { unauthenticatedInterceptor } from './interceptors/unauthenticated.interceptor';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HomeComponent as OrganizerHomeComponent } from './pages/organizer/home/home.component';
import { HomeComponent as AttendeeHomeComponent } from './pages/attendee/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    RoleComponent,
    PrivateComponent,
    OrganizerHomeComponent,
    AttendeeHomeComponent,
  ],
  imports: [
    RouterModule,
    RouterOutlet,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  providers: [
    appConfig.providers,
    provideHttpClient(withInterceptors([
      notFoundInterceptor,
      unauthenticatedInterceptor
    ])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }