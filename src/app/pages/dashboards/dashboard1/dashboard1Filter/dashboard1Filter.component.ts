import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-gtin-dialog',
    templateUrl: './dashboard1Filter.component.html',
    styleUrl: './dashboard1Filter.component.scss',
    standalone: true,
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule]
})
export class GtinDialogComponent {
    gtinList: string = '';

    constructor(
        public dialogRef: MatDialogRef<GtinDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onGtinInput(event: Event): void {
        const input = (event.target as HTMLTextAreaElement).value;
        // Solo permite números, comas y saltos de línea
        this.gtinList = input.replace(/[^0-9,\n]/g, '');
    }

    confirm() {
        const gtins = this.gtinList
            .split(/[\n,]/)
            .map(g => g.trim())
            .filter(g => g.length > 0);
        this.dialogRef.close(gtins);
    }
}
