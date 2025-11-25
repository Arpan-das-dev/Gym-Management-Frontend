import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const authGuard: CanActivateFn = () => {
  const authservice = inject(Authservice);
  const router = inject(Router);

  console.log("🔐 [authGuard] Checking authentication");

  if (authservice.isLoggedIn() && !authservice.isTokenExpired()) {
    console.log("✔️ [authGuard] Auth OK");
    return true;
  }

  console.log("❌ [authGuard] Auth failed → redirect to /login");
  router.navigate(['login']);
  return false;
};