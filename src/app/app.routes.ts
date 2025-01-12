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
    canActivate: [authGuard, hasRoleGuard]
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
    canActivate: [authGuard, hasRoleGuard]
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
