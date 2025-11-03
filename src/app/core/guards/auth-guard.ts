import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const authGuard: CanActivateFn = (route, state) => {
  const authservice = inject(Authservice);
  const router = inject(Router);
  if(authservice.isLoggedIn()) {
    return true;
  }else{
    router.navigate(['login'])
    return false
  }
};
