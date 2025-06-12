import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Training } from '../models/training.model';
import { Exercise } from '../models/exercise.model';
import { Set } from '../models/set.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})

export class TrainingService {
  private readonly baseUrl = 'http://localhost:3000/api';

  private isGeneratingSubject = new BehaviorSubject<boolean>(false); // przechowuje stan generowania treningu
  isGenerating$ = this.isGeneratingSubject.asObservable(); // observable do subskrypcji na zmiany stanu generowania

  private generationCompleteSubject = new Subject<void>(); // sluzy do powiadamiania o zakończeniu generowania treningu
  generationComplete$ = this.generationCompleteSubject.asObservable(); // observable do subskrypcji na zdarzenie zakończenia generowania

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.status === 401) {
      this.tokenService.removeToken();
      window.location.href = '/login';
    }
    return throwError(() => error);
  }

  getTrainings(): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.baseUrl}/trainings`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTraining(id: string): Observable<Training> {
    return this.http.get<Training>(`${this.baseUrl}/trainings/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createTraining(training: Training): Observable<Training> {
    const user = this.tokenService.getUser();
    if (!user) {
      console.error('Nie znaleziono danych użytkownika w tokenie');
      return throwError(() => new Error('Nie znaleziono użytkownika'));
    }
    if (!user._id) {
      console.error('Nie znaleziono ID użytkownika w bazie danych:', user);
      return throwError(() => new Error('Nie znaleziono ID użytkownika'));
    }

    training.userId = user._id;

    const trainingToSend = {
      name: training.name.trim(),
      userId: user._id,
      exercises: training.exercises.map(exercise => ({
        name: exercise.name.trim(),
        sets: exercise.sets.map(set => ({
          weight: Number(set.weight),
          reps: Number(set.reps),
          isConfirmed: set.isConfirmed
        }))
      }))
    };

    console.log(JSON.stringify(trainingToSend, null, 2));

    return this.http.post<Training>(`${this.baseUrl}/trainings`, trainingToSend, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Odpowiedź serwera:', error.error);
          return this.handleError(error);
        })
      );
  }

  updateTraining(id: string, training: Training): Observable<Training> {
    return this.http.put<Training>(`${this.baseUrl}/trainings/${id}`, training, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteTraining(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trainings/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  addExercise(trainingId: string, exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.baseUrl}/trainings/${trainingId}/exercises`, exercise, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateExercise(trainingId: string, exerciseId: string, exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.baseUrl}/trainings/${trainingId}/exercises/${exerciseId}`, exercise, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteExercise(trainingId: string, exerciseId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trainings/${trainingId}/exercises/${exerciseId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  addSet(trainingId: string, exerciseId: string, set: Set): Observable<Set> {
    return this.http.post<Set>(`${this.baseUrl}/trainings/${trainingId}/exercises/${exerciseId}/sets`, set, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSet(trainingId: string, exerciseId: string, setId: string, set: Set): Observable<Set> {
    return this.http.put<Set>(`${this.baseUrl}/trainings/${trainingId}/exercises/${exerciseId}/sets/${setId}`, set, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSet(trainingId: string, exerciseId: string, setId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trainings/${trainingId}/exercises/${exerciseId}/sets/${setId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  generateTraining(): Observable<Training> {
    this.isGeneratingSubject.next(true);
    return this.http.post<Training>(`${this.baseUrl}/trainings/generate`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.isGeneratingSubject.next(false);
          this.generationCompleteSubject.next();
        }),
        catchError(error => {
          this.isGeneratingSubject.next(false);
          return this.handleError(error);
        })
      );
  }
}
