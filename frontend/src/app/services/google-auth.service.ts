import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {
  private clientId = environment.googleClientId;
  private isInitialized = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  initializeGoogleAuth(): void {
    if (this.isInitialized) return;

    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup'
    });

    this.isInitialized = true;
  }

  private handleCredentialResponse(response: any): void {
    if (!response.credential) {
      console.error('No credential received from Google');
      return;
    }

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: () => {
        if (this.router.url === '/login') {
          this.router.navigate(['/training']);
        }
      },
      error: (error) => {
        console.error('Google login error:', error);
        alert('Wystąpił błąd podczas logowania. Spróbuj ponownie później.');
      }
    });
  }

  renderButton(elementId: string): void {
    if (!this.isInitialized) {
      this.initializeGoogleAuth();
    }

    try {
      google.accounts.id.renderButton(
        document.getElementById(elementId),
        { 
          theme: 'filled_blue',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          type: 'standard',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }
} 