import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  // pobiera token z TokenService i ustawia go w naglowkach
  getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }
}
