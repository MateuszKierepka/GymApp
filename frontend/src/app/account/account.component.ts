import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    MaterialModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})

export class AccountComponent implements OnInit {
  accountForm: FormGroup;
  passwordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  private nameValidator = Validators.pattern(/^[A-Z][a-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]*$/);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      firstName: ['', [Validators.required, this.nameValidator]],
      lastName: ['', [Validators.required, this.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // pobranie danych uzytkownika
  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.accountForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword');
    const confirmPassword = g.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit() {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      this.authService.updateAccount(formData).subscribe({
        next: () => {
          this.successMessage = 'Dane zostały zaktualizowane';
          this.errorMessage = '';
          const user = this.authService.getCurrentUser();
          if (user) {
            this.accountForm.patchValue({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              currentPassword: ''
            });
            Object.keys(this.accountForm.controls).forEach(key => {
              const control = this.accountForm.get(key);
              control?.setErrors(null);
            });
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Wystąpił błąd podczas aktualizacji danych';
          this.successMessage = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  onPasswordChange() {
    if (this.passwordForm.valid) {
      const formData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };
      this.authService.updatePassword(formData).subscribe({
        next: () => {
          this.successMessage = 'Hasło zostało zmienione';
          this.errorMessage = '';
          this.passwordForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          Object.keys(this.passwordForm.controls).forEach(key => {
            const control = this.passwordForm.get(key);
            control?.setErrors(null);
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error.message || 'Wystąpił błąd podczas zmiany hasła';
          this.successMessage = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  deleteAccount() {
    if (confirm('Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć.')) {
      this.authService.deleteAccount().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error.message || 'Wystąpił błąd podczas usuwania konta';
        }
      });
    }
  }
}
