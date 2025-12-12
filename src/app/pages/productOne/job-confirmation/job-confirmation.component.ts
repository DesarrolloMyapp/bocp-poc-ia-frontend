import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-confirmation',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CommonModule
  ],
  templateUrl: './job-confirmation.component.html',
  styleUrls: ['./job-confirmation.component.scss']
})
export class JobConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<JobConfirmationComponent>
  ) { }

  goToJobs() {
    this.dialogRef.close(true);
  }

  closeModal() {
    this.dialogRef.close(false);
  }
} 