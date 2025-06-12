import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule
  ]
})

export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  verificationForm: FormGroup;
  resetPasswordForm: FormGroup;
  
  resendTimer: number = 60;
  codeTimer: number = 60;
  canResend: boolean = true;
  isCodeValid: boolean = true;
  
  private resendInterval: any;
  private codeInterval: any;

  // stany resetowania hasla
  currentStep: 'email' | 'verification' | 'reset' = 'email';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  sendVerificationCode() {
    if (this.forgotPasswordForm.valid && this.canResend) {
      const email = this.forgotPasswordForm.get('email')?.value;
      
      this.authService.sendVerificationCode(email).subscribe({
        next: () => {
          this.startResendTimer();
          this.startCodeTimer();
          this.currentStep = 'verification';
          this.snackBar.open('Kod weryfikacyjny zostal wyslany', 'Zamknij', {
            duration: 3000
          });
        },
        error: (error) => {
          if (error.status === 429) {
            this.startResendTimer();
            this.resendTimer = error.error.timeLeft;
          }
          this.snackBar.open(error.error.message || 'Wystapil blad', 'Zamknij', {
            duration: 3000
          });
        }
      });
    }
  }

  verifyCode() {
    if (this.verificationForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      const code = this.verificationForm.get('code')?.value;

      this.authService.verifyCode(email, code).subscribe({
        next: () => {
          this.currentStep = 'reset';
          this.snackBar.open('Kod weryfikacyjny jest prawidlowy', 'Zamknij', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Wystapil blad', 'Zamknij', {
            duration: 3000
          });
        }
      });
    }
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      const code = this.verificationForm.get('code')?.value;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

      this.authService.resetPassword(email, code, newPassword).subscribe({
        next: () => {
          this.snackBar.open('Haslo zostalo zmienione', 'Zamknij', {
            duration: 3000
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Wystapil blad', 'Zamknij', {
            duration: 3000
          });
        }
      });
    }
  }

  private startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;
    
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  private startCodeTimer() {
    this.isCodeValid = true;
    this.codeTimer = 60;
    
    this.codeInterval = setInterval(() => {
      this.codeTimer--;
      if (this.codeTimer <= 0) {
        this.isCodeValid = false;
        clearInterval(this.codeInterval);
      }
    }, 1000);
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  ngOnDestroy() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
    if (this.codeInterval) {
      clearInterval(this.codeInterval);
    }
  }
} 