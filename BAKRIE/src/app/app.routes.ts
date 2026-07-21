import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { BpiOnlineComponent } from './pages/bpi-online/bpi-online';
import { HelpdeskComponent } from './pages/helpdesk/helpdesk';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'helpdesk', component: HelpdeskComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'bpi-online', component: BpiOnlineComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

