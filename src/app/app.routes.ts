import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleComponent } from './pages/role/role.component';
import { authGuard } from './guards/auth.guard';
import { hasRoleGuard } from './guards/has-role.guard';
import { PrivateComponent } from './layouts/private/private.component';
import { completeAuthGuard } from './guards/complete-auth.guard';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

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
  {
    path: "terms_and_conditions",
    component: TermsAndConditionsComponent,
  },
  {
    path: "privacy_policy",
    component: PrivacyPolicyComponent,
  }
];

export const routes: Routes = [
  {
    path: "",
    children: publicRoutes
  },
  {
    path: "organizer/dashboard",
    component: PrivateComponent,
    loadChildren: () => import('./mod-organizer/mod-organizer.module').then(m => m.ModOrganizerModule),
    canMatch: [completeAuthGuard]
  },
  {
    path: "attendee/dashboard",
    component: PrivateComponent,
    loadChildren: () => import('./mod-attendee/mod-attendee.module').then(m => m.ModAttendeeModule),
    canMatch: [completeAuthGuard]
  },
  {
    path: "**",
    redirectTo: "login",
  }
];
