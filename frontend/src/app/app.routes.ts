import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { TrainingListComponent } from './training/training-list/training-list.component';
import { TrainingDetailComponent } from './training/training-detail/training-detail.component';
import { authGuard } from './guards/auth.guard';
import { AccountComponent } from './account/account.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'training',
    children: [
      { path: '', component: TrainingListComponent },
      { path: 'new', component: TrainingDetailComponent },
      { path: ':id', component: TrainingDetailComponent },
      { path: ':id/edit', component: TrainingDetailComponent }
    ],
    canActivate: [authGuard],
    data: { requiresAuth: true }
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
    data: { requiresAuth: true }
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [authGuard],
    data: { requiresAuth: true }
  },
  { path: '**', redirectTo: '/login' }
];
