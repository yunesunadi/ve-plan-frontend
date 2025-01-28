import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleComponent } from './pages/role/role.component';
import { authGuard } from './guards/auth.guard';
import { hasRoleGuard } from './guards/has-role.guard';
import { PrivateComponent } from './layouts/private/private.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HomeComponent as OrganizerHomeComponent } from './pages/organizer/home/home.component';
import { HomeComponent as AttendeeHomeComponent } from './pages/attendee/home/home.component';
import { EventViewComponent as OrganizerEventViewComponent } from './pages/organizer/event-view/event-view.component';
import { completeAuthGuard } from './guards/complete-auth.guard';
import { EventViewComponent as AttendeeEventViewComponent } from './pages/attendee/event-view/event-view.component';
import { RegisteredUsersComponent } from './pages/organizer/registered-users/registered-users.component';

const publicRoutes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "role",
    component: RoleComponent,
    canActivate: [authGuard, hasRoleGuard]
  },
];

const organizerRoutes: Routes = [
  {
    path: "home",
    component: OrganizerHomeComponent,
    canActivate: [completeAuthGuard]
  },
  {
    path: "events/:id/view",
    component: OrganizerEventViewComponent,
    canActivate: [completeAuthGuard]
  },
  {
    path: "events/:id/registered_users",
    component: RegisteredUsersComponent,
    canActivate: [completeAuthGuard]
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
]

const attendeeRoutes: Routes = [
  {
    path: "home",
    component: AttendeeHomeComponent,
    canActivate: [completeAuthGuard]
  },
  {
    path: "events/:id/view",
    component: AttendeeEventViewComponent,
    canActivate: [completeAuthGuard]
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];

export const routes: Routes = [
  {
    path: "",
    children: publicRoutes
  },
  {
    path: "organizer/dashboard",
    component: PrivateComponent,
    children: organizerRoutes
  },
  {
    path: "attendee/dashboard",
    component: PrivateComponent,
    children: attendeeRoutes
  },
  {
    path: "**",
    redirectTo: "login",
  }
];
