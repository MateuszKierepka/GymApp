import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AdminService {
  constructor(private apiService: ApiService) {}

  getUsers(): Observable<User[]> { // observable nie blokuje glownego watku i automatycznie aktualizuje ui gdy sie zmieniaja dane
    return this.apiService.get<User[]>('/admin/users');
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> { // partial oznacza, ze userData moze zawierac dowolna kombinacje pol z typu User
    return this.apiService.put<User>(`/admin/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<void> {
    return this.apiService.delete<void>(`/admin/users/${userId}`);
  }

  toggleAdminRole(userId: string, isAdmin: boolean): Observable<User> {
    return this.apiService.put<User>(`/admin/users/${userId}/role`, { isAdmin });
  }
} 