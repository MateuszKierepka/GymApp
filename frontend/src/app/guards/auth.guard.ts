import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated$.pipe( // isAuthenticated$ - strumien ktory mowi o stanie autentykacji
    take(1), // bierze 1. wartosc
    map(isAuthenticated => {
      console.log('AuthGuard: Sprawdzanie autentykacji:', isAuthenticated);
      if (!isAuthenticated) {
        console.log('AuthGuard: Brak autentykacji - przekierowanie do logowania');
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
}; 