import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    SharedModule,
    RouterModule,
    MaterialModule,
    MatSnackBarModule
  ]
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';

  // tylko litery i pierwsza duża
  private nameValidator = Validators.pattern(/^[A-Z][a-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]*$/);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, this.nameValidator]],
      lastName: ['', [Validators.required, this.nameValidator]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/training']);
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { confirmPassword, ...registerData } = this.registerForm.value;
      this.authService.register(registerData).subscribe({
        next: () => {
          this.snackBar.open('Rejestracja zakończona sukcesem!', 'Zamknij', { duration: 3000 });
          this.router.navigate(['/training']);
        },
        error: (error: any) => {
          this.errorMessage = error.error.message || 'Błąd rejestracji. Spróbuj ponownie.';
          this.snackBar.open(this.errorMessage, 'Zamknij', { duration: 3000 });
        }
      });
    }
  }
}
