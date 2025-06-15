import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UpdateAccountRequest,
  UpdatePasswordRequest,
  User 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false); // przechowuje aktualny stan autentykacji, na poczatku false
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); // pozwala komponentom subskrybować się na zmiany stanu autentykacji, asObservable zabezpiecza przed bezpośrednią modyfikacją stanu z zewnątrz

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {
    const isLoggedIn = this.tokenService.isLoggedIn();
    console.log('AuthService: Inicjalizacja stanu autentykacji:', isLoggedIn);
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  updateAccount(userData: UpdateAccountRequest): Observable<AuthResponse> {
    return this.apiService.put<AuthResponse>('/auth/account', userData).pipe(
      tap(response => {
        this.tokenService.setUser(response.user);
        if (response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }

  updatePassword(passwordData: UpdatePasswordRequest): Observable<AuthResponse> {
    return this.apiService.put<AuthResponse>('/auth/password', passwordData).pipe(
      tap(response => {
        if (response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }

  deleteAccount(): Observable<any> {
    return this.apiService.delete<any>('/auth/account').pipe(
      tap(() => {
        this.logout();
      })
    );
  }

  logout(): void {
    console.log('AuthService: Wylogowywanie użytkownika');
    this.tokenService.removeToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const isLoggedIn = this.tokenService.isLoggedIn();
    console.log('AuthService: Token:', this.tokenService.getToken());
    return isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.tokenService.getUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.apiService.post<any>(`/auth/send-verification-code`, { email });
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.apiService.post<any>(`/auth/verify-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.apiService.post<any>(`/auth/reset-password`, { email, code, newPassword });
  }

  loginWithGoogle(credential: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/google-login', { credential }).pipe(
      tap(response => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }
}
