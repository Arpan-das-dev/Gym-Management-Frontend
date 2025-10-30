import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const roleGuard: CanActivateFn = (route, state) => {
  const authservice = inject(Authservice);
  const router = inject(Router)
  if(!authservice.isLoggedIn()) {
    router.navigate(['/login'])
    return false;
  }

  const allowedRoles = route.data['roles'] as string[];
  const userRole: string | null = authservice.getUserRole();
  
  if(allowedRoles.includes(userRole as string) && !authservice.isTokenExpired()) {
    return true;
  }
   router.navigate(['/unauthorized']); // or '/login'
  return false;
};
