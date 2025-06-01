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
import { MatDialogModule } from '@angular/material/dialog';
import { EventDialogComponent } from './components/event-dialog/event-dialog.component';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { EventDetailsDialogComponent } from './components/event-details-dialog/event-details-dialog.component';
import { SessionDialogComponent } from './components/session-dialog/session-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { RegisterApprovalDialogComponent } from './components/register-approval-dialog/register-approval-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { InvitationSentDialogComponent } from './components/invitation-sent-dialog/invitation-sent-dialog.component';
import { InvitedUsersDialogComponent } from './components/invited-users-dialog/invited-users-dialog.component';
import { AcceptedUsersDialogComponent } from './components/accepted-users-dialog/accepted-users-dialog.component';
import { MeetingStartedDialogComponent } from './components/meeting-started-dialog/meeting-started-dialog.component';
import { MatDividerModule } from "@angular/material/divider";
import { SettingComponent } from './pages/setting/setting.component';
import { AttendeeMeetingDialogComponent } from './components/attendee-meeting-dialog/attendee-meeting-dialog.component';
import { OrganizerMeetingDialogComponent } from './components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { EventsComponent } from './pages/events/events.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    RoleComponent,
    PrivateComponent,
    EventsComponent,
    EventDialogComponent,
    EventDetailsDialogComponent,
    SessionDialogComponent,
    RegisterApprovalDialogComponent,
    InvitationSentDialogComponent,
    InvitedUsersDialogComponent,
    AcceptedUsersDialogComponent,
    MeetingStartedDialogComponent,
    AttendeeMeetingDialogComponent,
    OrganizerMeetingDialogComponent,
    SettingComponent,
    NotFoundComponent,
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
    MatDialogModule,
    MatTimepickerModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatExpansionModule
  ],
  providers: [
    appConfig.providers,
    provideHttpClient(withInterceptors([
      notFoundInterceptor,
      unauthenticatedInterceptor,
      unauthorizedInterceptor,
    ])),
    provideNativeDateAdapter()
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }