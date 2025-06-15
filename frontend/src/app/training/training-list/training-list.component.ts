import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../shared/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { Training } from '../../models/training.model';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css']
})

export class TrainingListComponent implements OnInit {
  trainings: Training[] = [];
  expandedTrainingId: string | null = null; // przechowuje id rozwinietego treningu
  isGenerating = false;

  constructor(
    private trainingService: TrainingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTrainings();
    this.trainingService.isGenerating$.subscribe(isGenerating => {
      this.isGenerating = isGenerating;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
    this.trainingService.generationComplete$.subscribe(() => {
      this.loadTrainings();
      setTimeout(() => {
        this.cdr.detectChanges();
      });
      this.snackBar.open('Trening został wygenerowany pomyślnie!', 'Zamknij', {
        duration: 3000
      });
    });
  }

  loadTrainings() {
    this.trainingService.getTrainings().subscribe({
      next: (trainings) => {
        this.trainings = trainings;
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading trainings:', error);
      }
    });
  }

  toggleOrViewTraining(trainingId: string) {
    this.expandedTrainingId = this.expandedTrainingId === trainingId ? null : trainingId;
  }

  createNewTraining() {
    this.router.navigate(['/training/new']);
  }

  editTraining(training: Training) {
    this.router.navigate(['/training', training._id, 'edit']);
  }

  deleteTraining(training: Training) {
    if (confirm('Czy na pewno chcesz usunąć ten trening?')) {
      this.trainingService.deleteTraining(training._id!).subscribe({
        next: () => {
          this.loadTrainings();
        },
        error: (error) => {
          console.error('Error deleting training:', error);
        }
      });
    }
  }

  async exportToPDF(training: Training) {
    this.snackBar.open('Generowanie PDF...', 'Zamknij', { duration: 2000 });
    
    const createPageElement = (content: string) => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '-9999px';
      element.style.width = '750px';
      element.innerHTML = `
        <div style="
          padding: 20px 30px;
          font-family: 'Arial', sans-serif;
          width: 100%;
          background-color: white;
          box-sizing: border-box;
        ">
          ${content}
        </div>
      `;
      return element;
    };

    // funkcja pomocnicza do przeliczania wysokosci obrazka na podstawie canvasu
    const getImageHeight = (canvas: HTMLCanvasElement, targetWidth: number) => {
      return (canvas.height / canvas.width) * targetWidth;
    };

    const generatePage = async (element: HTMLElement) => {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 750,
        height: element.offsetHeight
      });
      return canvas;
    };

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      
      const addFooter = (pageNumber: number) => {
        pdf.setFontSize(10);
        pdf.setTextColor(102);
        pdf.text(`Strona ${pageNumber}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      };
      
      const headerContent = `
        <div style="
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #2196F3;
          width: 100%;
        ">
          <h1 style="
            color: #2196F3;
            font-size: 32px;
            margin: 0;
            padding: 0;
            font-weight: bold;
            width: 100%;
          ">${training.name}</h1>
          <p style="
            color: #666;
            font-size: 18px;
            margin-top: 10px;
            margin-bottom: 5px;
            width: 100%;
          ">Plan treningu</p>
          <p style="
            color: #666;
            font-size: 12px;
            margin: 0;
            width: 100%;
          ">Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        <div style="
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
        ">
          <div style="
            display: flex;
            justify-content: space-around;
            text-align: center;
            width: 100%;
          ">
            <div>
              <h3 style="color: #2196F3; margin: 0; font-size: 24px;">${training.exercises.length}</h3>
              <p style="color: #666; margin: 5px 0 0 0;">Ćwiczeń</p>
            </div>
            <div>
              <h3 style="color: #2196F3; margin: 0; font-size: 24px;">${training.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}</h3>
              <p style="color: #666; margin: 5px 0 0 0;">Serii</p>
            </div>
          </div>
        </div>
      `;

      const headerElement = createPageElement(headerContent);
      document.body.appendChild(headerElement);
      const headerCanvas = await generatePage(headerElement);
      document.body.removeChild(headerElement);
      const headerImg = headerCanvas.toDataURL('image/png');
      const headerImgHeight = getImageHeight(headerCanvas, imgWidth);
      pdf.addImage(headerImg, 'PNG', 10, 10, imgWidth, headerImgHeight);

      addFooter(1);

      let currentY = 10 + headerImgHeight;
      let currentPage = 1;

      for (let i = 0; i < training.exercises.length; i++) {
        const exercise = training.exercises[i];
        const exerciseContent = `
          <div style="
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            width: 100%;
            box-sizing: border-box;
          ">
            <div style="
              background-color: #2196F3;
              color: white;
              padding: 12px 20px;
              font-size: 20px;
              font-weight: bold;
              width: 100%;
              box-sizing: border-box;
            ">
              ${i + 1}. ${exercise.name}
            </div>
            <div style="padding: 15px; width: 100%; box-sizing: border-box;">
              <table style="width: 100%; border-collapse: collapse; box-sizing: border-box;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e0e0e0;">Seria</th>
                    <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e0e0e0;">Ciężar</th>
                    <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e0e0e0;">Powtórzenia</th>
                  </tr>
                </thead>
                <tbody>
                  ${exercise.sets.map((set, setIndex) => `
                    <tr>
                      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${setIndex + 1}</td>
                      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e0e0e0;">${set.weight} kg</td>
                      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e0e0e0;">${set.reps}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

        const exerciseElement = createPageElement(exerciseContent);
        document.body.appendChild(exerciseElement);
        const exerciseCanvas = await generatePage(exerciseElement);
        document.body.removeChild(exerciseElement);
        const exerciseImg = exerciseCanvas.toDataURL('image/png');
        const exerciseImgHeight = getImageHeight(exerciseCanvas, imgWidth);

        // Sprawdzamy, czy ćwiczenie zmieści się na aktualnej stronie
        if (currentY + exerciseImgHeight > pdfHeight - 20) { // Zwiększamy margines na stopkę
          pdf.addPage();
          currentPage++;
          currentY = 10;
          addFooter(currentPage);
        }

        pdf.addImage(exerciseImg, 'PNG', 10, currentY, imgWidth, exerciseImgHeight);
        currentY += exerciseImgHeight;
      }

      pdf.save(`${training.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
      this.snackBar.open('PDF został wygenerowany pomyślnie!', 'Zamknij', { duration: 3000 });
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
      this.snackBar.open('Wystąpił błąd podczas generowania PDF', 'Zamknij', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  generateTraining() {
    this.trainingService.generateTraining().subscribe({
      error: (error) => {
        console.error('Error generating training:', error);
        this.snackBar.open('Wystąpił błąd podczas generowania treningu', 'Zamknij', {
          duration: 3000
        });
      }
    });
  }
}
