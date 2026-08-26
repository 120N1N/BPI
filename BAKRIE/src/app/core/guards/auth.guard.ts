import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Cek apakah ada token di localStorage (artinya sudah login)
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return true;
  }
  
  // Jika belum login, tendang ke halaman login
  router.navigate(['/login']);
  return false;
};
