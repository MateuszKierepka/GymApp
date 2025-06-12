import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0); // przechowuje aktualną wartość timera, poczatkowo 0s
  private timerActive = false;
  private timerSubscription: any; // pozwala na zatrzymanie timera w dowolnym momencie

  constructor() {}

  startTimer(duration: number = 60): Observable<number> {
    this.timerActive = true;
    this.timerSubject.next(duration);

    this.timerSubscription = timer(0, 1000) // strumien emituje wartosc co 1s, pierwsza wartosc od razu (0)
      .pipe(
        takeWhile(() => this.timerActive), // kontynuuje dopoki timerActive
        map(() => {
          const currentTime = this.timerSubject.value;
          if (currentTime <= 0) {
            this.timerActive = false;
            return 0;
          }
          this.timerSubject.next(currentTime - 1);
          return currentTime - 1;
        })
      )
      .subscribe();

    return this.timerSubject.asObservable();
  }

  stopTimer() {
    this.timerActive = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubject.next(0);
  }
} 