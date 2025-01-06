import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleComponent } from './pages/role/role.component';

export const publicRoutes: Routes = [
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
  }
]

export const routes: Routes = [
  {
    path: "",
    children: publicRoutes
  },
];
