import { Routes } from '@angular/router';
import { Login } from './featured/auth/login/login';
import { Signup } from './featured/auth/signup/signup';
import { Homepage } from './shared/components/homepage/homepage';
import { Plan } from './featured/plan/plan';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'plans', component: Plan },
  // path for auths
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./featured/auth/email-verification/email-verification').then(
        (m) => m.EmailVerification
      ),
  },
  {
    path: 'verify-phone',
    loadComponent: () =>
      import('./featured/auth/phone-verification/phone-verification').then(
        (m) => m.PhoneVerification
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./featured/auth/forgot-password/forgot-password').then(
        (m) => m.ForgotPassword
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./featured/auth/reset-password/reset-password').then(
        (m) => m.ResetPassword
      ),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./featured/auth/change-password/change-password').then(
        (m) => m.ChangePassword
      ),
  },
  // role based dashboard lazy loading with guards
  // 1. admin dashboard
  {
    path: 'dashboard',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard
      ),
  },

  // 2. member dashboard
  {
    path: 'member-dashboard',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['MEMBER'] },
    loadComponent: () =>
      import('./featured/member-dasboard/member-dasboard').then(
        (m) => m.MemberDasboard
      ),
  },

  // 3. trainer dashboard
  {
    path: 'trainer-dashboard',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['TRAINER', 'TRAINER_PENDING'] },
    loadComponent: () =>
      import('./featured/trainer-dasboard/trainer-dasboard').then(
        (t) => t.TrainerDasboard
      ),
  },
  {
    path: 'allMembers',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import(
        './featured/admin-dashboard/view-all-members/view-all-members'
      ).then((m) => m.ViewAllMembers),
  },
  {
    path: 'createUser',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/auth/create-user/create-user').then(
        (m) => m.CreateUser
      ),
  },
  {
    path: 'createPlan',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/plan/create-plans/create-plans').then(
        (m) => m.CreatePlans
      ),
  },
  {
    path: 'buyPlan',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./featured/plan/buy-plan/buy-plan').then((m) => m.BuyPlan),
  },
  {
    path: 'managePlans',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/plan/manage-plans/manage-plans').then(
        (m) => m.ManagePlans
      ),
  },

  {
    path: 'manageCuponCodes',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/plan/cupcode-management/cupcode-management').then(
        (m) => m.CupcodeManagement
      ),
  },

  {
    path: 'manageProducts',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/store/product-managements/product-managements').then(
        (m) => m.ProductManagements
      ),
  },

  {
    path: 'recentTransactions',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./featured/plan/recent-transactions/recent-transactions').then(
        (m) => m.RecentTransactions
      ),
  },
  // path for footer
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./shared/terms-of-service/terms-of-service').then(
        (t) => t.TermsOfService
      ),
  },

  { path: '**', redirectTo: '/error' },
];
