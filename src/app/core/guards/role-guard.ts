import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const roleGuard: CanActivateFn = (route, state) => {
  const authservice = inject(Authservice);
  const router = inject(Router);

  console.log("🔐 [roleGuard] Activated for route:", state.url);

  if (!authservice.isLoggedIn()) {
    console.log("❌ [roleGuard] User not logged in → redirect to /login");
    router.navigate(['login']);
    return false;
  }

  if (authservice.isTokenExpired()) {
    console.log("❌ [roleGuard] Token expired → redirect to /login");
    router.navigate(['login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authservice.getRole() || authservice.getUserRole();

  console.log("ℹ️ [roleGuard] Allowed roles:", allowedRoles);
  console.log("ℹ️ [roleGuard] User role:", userRole);

  if (!userRole) {
    console.log("❌ [roleGuard] User role not found → redirect to /login");
    router.navigate(['login']);
    return false;
  }

  // 🔥 Rule: trainer_pending can access trainer dashboard
  if (allowedRoles.includes('TRAINER') && userRole.includes('TRAINER_PENDING')) {
    console.log("✔️ [roleGuard] TRAINER_PENDING allowed to access TRAINER route (custom rule)");
    return true;
  }

  // Normal role check
  const isAllowed = allowedRoles.some((role) => userRole.includes(role));

  console.log("🔎 [roleGuard] isAllowed:", isAllowed);

  if (isAllowed) {
    console.log("✔️ [roleGuard] Access granted");
    return true;
  }

  console.log("❌ [roleGuard] Access denied → redirect to /login");
  router.navigate(['login']);
  return false;
};