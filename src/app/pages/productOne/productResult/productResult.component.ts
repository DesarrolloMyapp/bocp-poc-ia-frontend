import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-productResult',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        ClipboardModule,
        NgIf
    ],
    templateUrl: './productResult.component.html',
})

export class ProcessResultComponent {

    public job_id: string = '';
    
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private clipboard: Clipboard,
        private dialogRef: MatDialogRef<ProcessResultComponent>
    ) { }

    ngOnInit() {
        this.job_id = this.data.job_id;
    }

    copyLink() {
        this.clipboard.copy(this.data.processed_image_url);
        alert('Enlace copiado al portapapeles');
    }

    goToJobs() {
        this.dialogRef.close(true); // Cerrar el modal y devolver true para indicar redirección
    }
}
