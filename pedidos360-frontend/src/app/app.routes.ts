import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { App } from './app';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ClientePortalComponent } from './components/cliente-portal/cliente-portal.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: App,
    canActivate: [MsalGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [MsalGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'portal',
    component: ClientePortalComponent,
    canActivate: [MsalGuard, RoleGuard],
    data: { roles: ['CLIENTE'] }
  },
  {
    path: '403',
    component: AccessDeniedComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
