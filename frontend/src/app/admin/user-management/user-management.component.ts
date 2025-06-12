import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { AdminService } from '../../services/admin.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})

export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'isAdmin', 'actions'];
  loading = true;
  error = '';
  currentUser: User | null = null; // informacja o aktualnie zalogowanym uzytkowniku

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private tokenService: TokenService
  ) {
    this.currentUser = this.tokenService.getUser();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Wystąpił błąd podczas ładowania użytkowników';
        this.loading = false;
        console.error('Błąd podczas ładowania użytkowników:', error);
      }
    });
  }

  toggleAdminRole(user: User): void {
    this.adminService.toggleAdminRole(user._id, !user.isAdmin).subscribe({
      next: (updatedUser) => {
        this.loadUsers();
        this.snackBar.open(
          `Rola użytkownika ${updatedUser.firstName} ${updatedUser.lastName} została zmieniona`,
          'Zamknij',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Wystąpił błąd podczas zmiany roli użytkownika', 'Zamknij', { duration: 3000 });
        console.error('Błąd podczas zmiany roli:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Czy na pewno chcesz usunąć użytkownika ${user.firstName} ${user.lastName}?`)) {
      this.adminService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('Użytkownik został usunięty', 'Zamknij', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Wystąpił błąd podczas usuwania użytkownika', 'Zamknij', { duration: 3000 });
          console.error('Błąd podczas usuwania użytkownika:', error);
        }
      });
    }
  }
}
