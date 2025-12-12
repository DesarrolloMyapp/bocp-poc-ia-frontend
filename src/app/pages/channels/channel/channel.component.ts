
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChannelRableSettings } from '../../../../assets/config/channelTable/channelTableSettings'

@Component({
    selector: 'app-channels',
    standalone: true,
    imports: [
        MatIconModule,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    templateUrl: './channel.component.html',
    styleUrl: './channel.component.scss'
})
export class ChannelComponent {
    columns = ChannelRableSettings;
    displayedColumns = this.columns.map(c => c.key);
    channels = new MatTableDataSource<any>();
    isLoading = false;

    constructor(
        private productService: ProductService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.getProductChannels();
    }

    async getProductChannels() {
        this.isLoading = true;
        this.productService.productGetChannels().subscribe({
            next: (result: any) => {
                this.isLoading = false;
                if (typeof (result) === 'object') {
                    this.channels = new MatTableDataSource(result.channels);
                }
            },
            error: (error) => {
                this.isLoading = false;
                this.showMessage('Error al cargar los canales');
                console.error('Error:', error);
            }
        })
    }

    onCreateNew() {
        this.router.navigate(['/channels/view']);
    }

    onAction(action: string, row: any) {
        //('Acción:', action, 'Fila:', row);
        
        if (action === 'edit') {
            this.router.navigate(['/channels/view'], {
                queryParams: row
            });
        }
    }

    private showMessage(message: string) {
        this.snackBar.open(message, 'Cerrar', {
            duration: 3000
        });
    }
}