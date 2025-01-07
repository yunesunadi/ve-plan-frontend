import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleComponent } from './pages/role/role.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { hasRoleGuard } from './guards/has-role.guard';
import { PrivateComponent } from './layouts/private/private.component';

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
  }
];

const privateRoutes: Routes = [
  {
    path: "home",
    component: HomeComponent,
    canActivate: [authGuard]
  }
];

export const routes: Routes = [
  {
    path: "",
    children: publicRoutes
  },
  {
    path: "dashboard",
    component: PrivateComponent,
    children: privateRoutes
  },
];
