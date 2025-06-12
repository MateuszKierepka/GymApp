import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { Training } from '../../models/training.model';
import { Exercise } from '../../models/exercise.model';
import { Set } from '../../models/set.model';
import { ExerciseComponent } from '../exercise/exercise.component';
import { MaterialModule } from '../../shared/material.module';
import { SharedModule } from '../../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    MaterialModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    ExerciseComponent
  ],
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.css']
})

export class TrainingDetailComponent implements OnInit {
  @ViewChildren(ExerciseComponent) exerciseComponents!: QueryList<ExerciseComponent>; // lista komponnentow exercise
  
  training: Training = {
    name: '',
    exercises: []
  };
  isEditMode = false;
  isLiveTraining: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.loadTraining(id);
    }
  }

  goBack() {
    this.router.navigate(['/training']);
  }

  loadTraining(id: string) {
    this.trainingService.getTraining(id).subscribe({
      next: (training) => {
        this.training = training;
        this.training.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            set.isConfirmed = true;
          });
        });
      },
      error: (error) => {
        console.error('Error loading training:', error);
        this.snackBar.open('Błąd podczas ładowania treningu', 'Zamknij', { duration: 3000 });
        this.router.navigate(['/training']);
      }
    });
  }

  addExercise() {
    this.exerciseComponents.forEach(component => {
      component.stopTimer();
    });

    this.training.exercises.push({
      name: '',
      sets: [{
        weight: 0,
        reps: 0,
        isConfirmed: false
      }]
    });
  }

  deleteExercise(exercise: Exercise) {
    const index = this.training.exercises.indexOf(exercise);
    if (index > -1) {
      this.training.exercises.splice(index, 1);
    }
  }

  addSet(exercise: Exercise) {
    const exerciseComponent = this.exerciseComponents.find(comp => comp.exercise === exercise);
    if (exerciseComponent) {
      exerciseComponent.stopTimer();
    }
    
    exercise.sets.push({
      weight: 0,
      reps: 0,
      isConfirmed: false
    });
  }

  confirmSet(set: Set) {
    if (set.weight >= 0 && set.reps > 0) {
      set.isConfirmed = true;
    }
  }

  editSet(set: Set) {
    set.isConfirmed = false;
  }

  deleteSet(exercise: Exercise, set: Set) {
    const index = exercise.sets.indexOf(set);
    if (index > -1) {
      exercise.sets.splice(index, 1);
    }
  }

  toggleLiveTraining() {
    this.isLiveTraining = !this.isLiveTraining;
    if (!this.isLiveTraining) {
      this.exerciseComponents.forEach(component => {
        component.stopTimer();
      });
    }
  }

  saveTraining(): void {
    if (!this.training.name?.trim()) {
      this.snackBar.open('Nazwa treningu jest wymagana', 'Zamknij', { duration: 3000 });
      return;
    }
    if (!this.training.exercises?.length) {
      this.snackBar.open('Dodaj przynajmniej jedno ćwiczenie', 'Zamknij', { duration: 3000 });
      return;
    }

    for (const exercise of this.training.exercises) {
      if (!exercise.name?.trim()) {
        this.snackBar.open(`Ćwiczenie ${this.training.exercises.indexOf(exercise) + 1}. musi mieć nazwę`, 'Zamknij', { duration: 3000 });
        return;
      }
      if (!exercise.sets?.length) {
        this.snackBar.open(`Ćwiczenie "${exercise.name}" musi mieć przynajmniej jedną serię`, 'Zamknij', { duration: 3000 });
        return;
      }

      for (const set of exercise.sets) {
        if (!set.isConfirmed) {
          this.snackBar.open(`Musisz zatwierdzić wszystkie serie w ćwiczeniu "${exercise.name}"`, 'Zamknij', { duration: 3000 });
          return;
        }
        if (!set.weight || isNaN(Number(set.weight)) || Number(set.weight) <= 0 || Number(set.weight) > 350) {
          this.snackBar.open(`Nieprawidłowa waga w ćwiczeniu "${exercise.name}"`, 'Zamknij', { duration: 3000 });
          return;
        }
        if (!set.reps || isNaN(Number(set.reps)) || Number(set.reps) <= 0 || Number(set.reps) > 40) {
          this.snackBar.open(`Nieprawidłowa liczba powtórzeń w ćwiczeniu "${exercise.name}"`, 'Zamknij', { duration: 3000 });
          return;
        }
      }
    }

    if (this.isEditMode) {
      this.trainingService.updateTraining(this.training._id!, this.training).subscribe({
        next: () => {
          this.snackBar.open('Trening został zaktualizowany', 'Zamknij', { duration: 3000 });
          this.router.navigate(['/training']);
        },
        error: (error) => {
          console.error('Error updating training:', error);
          let errorMessage = 'Wystąpił błąd podczas aktualizacji treningu';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Zamknij', { duration: 5000 });
        }
      });
    } else {
      this.trainingService.createTraining(this.training).subscribe({
        next: () => {
          this.snackBar.open('Trening został zapisany', 'Zamknij', { duration: 3000 });
          this.router.navigate(['/training']);
        },
        error: (error) => {
          console.error('Error creating training:', error);
          let errorMessage = 'Wystąpił błąd podczas zapisywania treningu';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Zamknij', { duration: 5000 });
        }
      });
    }
  }
}
