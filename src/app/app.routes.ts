import { Routes } from '@angular/router';
import { Login } from './featured/auth/login/login';
import { Signup } from './featured/auth/signup/signup';
import { Homepage } from './shared/components/homepage/homepage';
import { Plan } from './featured/plan/plan';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Homepage },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'plans', component: Plan },
    {
        path: 'verify-email',
        loadComponent: () => import('./featured/auth/email-verification/email-verification')
            .then(m => m.EmailVerification)
    },
    {
        path: 'verify-phone',
        loadComponent: () => import('./featured/auth/phone-verification/phone-verification')
            .then(m => m.PhoneVerification)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./featured/auth/forgot-password/forgot-password')
            .then(m => m.ForgotPassword)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./featured/auth/reset-password/reset-password')
            .then(m => m.ResetPassword)
    },
    {
        path: 'change-password',
        loadComponent: () => import('./featured/auth/change-password/change-password')
            .then(m => m.ChangePassword)
    },
    {
        path: 'dashboard',
        canActivate :[roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./featured/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
    },
    { path: '**', redirectTo: '/error' }
];
