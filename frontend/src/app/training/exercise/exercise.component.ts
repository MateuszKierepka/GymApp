import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Exercise } from '../../models/exercise.model';
import { Set } from '../../models/set.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimerService } from '../../services/timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    FormsModule, 
    MatIconModule
  ],
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css']
})

export class ExerciseComponent implements OnDestroy {
  @Input() isLastExercise: boolean = false;
  @Input() isLiveTraining: boolean = false;
  @Input() exercise!: Exercise;
  
  @Output() deleteExercise = new EventEmitter<void>();
  @Output() addSet = new EventEmitter<void>();
  @Output() confirmSet = new EventEmitter<Set>();
  @Output() deleteSet = new EventEmitter<Set>();

  timerValue: number = 0;
  timerSubscription?: Subscription;
  showTimer: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private timerService: TimerService
  ) {}

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  onAddSet() {
    if (!this.isLastExercise) {
      this.showTimer = false;
    } else if (this.showTimer) {
      this.timerService.stopTimer();
      this.showTimer = false;
    }
    this.addSet.emit();
  }

  onConfirmSet(set: Set) {
    if (!set.weight || isNaN(Number(set.weight)) || Number(set.weight) <= 0 || Number(set.weight) > 350 ) {
      this.snackBar.open('Nieprawidłowa waga w ćwiczeniu', 'Zamknij', { duration: 3000 });
      return;
    }
    if (!set.reps || isNaN(Number(set.reps)) || Number(set.reps) <= 0 || Number(set.reps) > 40) {
      this.snackBar.open('Nieprawidłowa liczba powtórzeń w ćwiczeniu', 'Zamknij', { duration: 3000 });
      return;
    }
    set.isConfirmed = true;
    this.confirmSet.emit(set);

    if (this.isLiveTraining && this.isLastExercise && this.isLastConfirmedSet(set)) {
      this.stopTimer();
      this.startTimer();
    }
  }

  onDeleteSet(set: Set) {
    if (this.isLastExercise && this.isLastConfirmedSet(set)) {
      this.timerService.stopTimer();
      this.showTimer = false;
    }
    this.deleteSet.emit(set);
  }

  onDeleteExercise() {
    if (this.showTimer) {
      this.timerService.stopTimer();
      this.showTimer = false;
    }
    this.deleteExercise.emit();
  }

  onEditSet(set: Set) {
    set.isConfirmed = false;
  }

  isLastConfirmedSet(set: Set): boolean {
    const confirmedSets = this.exercise.sets.filter(s => s.isConfirmed);
    return confirmedSets.length > 0 && confirmedSets[confirmedSets.length - 1] === set;
  }

  onDuplicateSet(set: Set) {
    this.timerService.stopTimer();
    this.showTimer = false;
    const newSet: Set = {
      weight: set.weight,
      reps: set.reps,
      isConfirmed: true
    };
    this.exercise.sets.push(newSet);
    if (this.isLiveTraining && this.isLastExercise) {
      this.startTimer();
    }
  }

  private startTimer() {
    this.showTimer = true;
    this.timerSubscription = this.timerService.startTimer(60).subscribe(time => {
      this.timerValue = time;
    });
  }

  stopTimer() {
    this.timerService.stopTimer();
    this.showTimer = false;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  isLastTenSeconds(): boolean {
    return this.timerValue <= 10;
  }
}
