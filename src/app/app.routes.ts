import { Routes } from '@angular/router';
import { Login } from './featured/auth/login/login';
import { Signup } from './featured/auth/signup/signup';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    {
        path: 'verify-email',
        loadComponent: () => import('./featured/auth/email-verification/email-verification')
            .then(m => m.EmailVerification)
    },
    { path: 'verify-phone',
        loadComponent: () => import('./featured/auth/phone-verification/phone-verification')
            .then(m => m.PhoneVerification)
    },
    { path: 'forgot-password',
        loadComponent: () => import('./featured/auth/forgot-password/forgot-password')
            .then(m => m.ForgotPassword)
    },
    { path: 'reset-password',
        loadComponent: () => import('./featured/auth/reset-password/reset-password')
            .then(m => m.ResetPassword)
    },
    { path : 'change-password',
        loadComponent: () => import('./featured/auth/change-password/change-password')
            .then(m => m.ChangePassword)
    },
    { path: '**', redirectTo: '/error' }
];
