
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Channel } from 'src/app/model/channel';

@Component({
    selector: 'app-channelView',
    standalone: true,
    imports: [
        MatIconModule,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
    ],
    templateUrl: './channelView.component.html',
    styleUrl: './channelView.component.scss'
})
export class ChannelViewComponent {
    channel: Channel = {
        channelID: 0,
        gln: 0,
        provider: '',
        width: 0,
        height: 0,
        extension: '',
        dpi: 0,
        max_size_kb: 0,
        adaptation_type: '',
        renaming_type: '',
        rename_base: '',
        rename_separator: '',
        rename_start_index: 0,
        folder_structure: ''
    };
    isEditMode = false;
    isLoading = false;

    constructor(
        private productService: ProductService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params && params['channelID']) {
                this.isEditMode = true;
                // Crear una copia del objeto para evitar propiedades read-only
                this.channel = {
                    channelID: parseInt(params['channelID'] || '0'),
                    gln: parseInt(params['gln'] || '0'),
                    provider: params['provider'] || '',
                    width: parseInt(params['width'] || '0'),
                    height: parseInt(params['height'] || '0'),
                    extension: params['extension'] || '',
                    dpi: parseInt(params['dpi'] || '0'),
                    max_size_kb: parseInt(params['max_size_kb'] || '0'),
                    adaptation_type: params['adaptation_type'] || '',
                    renaming_type: params['renaming_type'] || '',
                    rename_base: params['rename_base'] || '',
                    rename_separator: params['rename_separator'] || '',
                    rename_start_index: parseInt(params['rename_start_index'] || '0'),
                    folder_structure: params['folder_structure'] || ''
                };
                //('Modo edición:', this.channel);
            } else {
                this.isEditMode = false;
                //('Modo creación');
            }
        });
    }

    getPreviewStyle(format: any) {
        // this.selectedChannel = format;
        if (!format?.width || !format?.height) return {};

        const maxBoxSize = 200;
        const ratio = format.width / format.height;

        let width: number;
        let height: number;

        if (ratio >= 1) {
            width = maxBoxSize;
            height = Math.round(maxBoxSize / ratio);
        } else {
            height = maxBoxSize;
            width = Math.round(maxBoxSize * ratio);
        }

        return {
            width: `${width}px`,
            height: `${height}px`,
        };
    }

    onSave() {
        if (!this.validateForm()) {
            return;
        }

        // Convertir campos numéricos a enteros
        const channelData = this.prepareChannelData();
        //('Datos del canal a guardar:', channelData);
        this.isLoading = true;

        if (this.isEditMode) {
            this.updateChannel(channelData);
        } else {
            this.createChannel(channelData);
        }
    }

    private validateForm(): boolean {
        if (!this.channel.provider || !this.channel.extension) {
            this.showMessage('Por favor, complete todos los campos requeridos');
            return false;
        }
        if (this.channel.width <= 0 || this.channel.height <= 0) {
            this.showMessage('Las dimensiones deben ser mayores a 0');
            return false;
        }
        if (this.channel.dpi <= 0) {
            this.showMessage('El DPI debe ser mayor a 0');
            return false;
        }
        if (!this.channel.adaptation_type || !this.channel.renaming_type) {
            this.showMessage('Por favor, seleccione el tipo de adaptación y renombrado');
            return false;
        }
        if (this.channel.renaming_type === 'custom' && !this.channel.rename_base) {
            this.showMessage('Por favor, ingrese la base del renombrado');
            return false;
        }
        return true;
    }

    private prepareChannelData(): Channel {
        return {
            ...this.channel,
            gln: parseInt(this.channel.gln?.toString() || '0'),
            width: parseInt(this.channel.width?.toString() || '0'),
            height: parseInt(this.channel.height?.toString() || '0'),
            dpi: parseInt(this.channel.dpi?.toString() || '0'),
            max_size_kb: parseInt(this.channel.max_size_kb?.toString() || '0'),
            rename_start_index: parseInt(this.channel.rename_start_index?.toString() || '0')
        };
    }

    private createChannel(channelData: Channel) {
        this.productService.productCreateChannel(channelData).subscribe({
            next: (result: any) => {
                this.isLoading = false;
                this.showMessage('Canal creado exitosamente');
                this.router.navigate(['/channels']);
            },
            error: (error) => {
                this.isLoading = false;
                this.showMessage('Error al crear el canal');
                console.error('Error:', error);
            }
        });
    }

    private updateChannel(channelData: Channel) {
        //('Datos para actualizar:', channelData);
        this.productService.productUpdateChannel(channelData.channelID, channelData).subscribe({
            next: (result: any) => {
                //('Respuesta del servidor:', result);
                this.isLoading = false;
                this.showMessage('Canal actualizado exitosamente');
                this.router.navigate(['/channels']);
            },
            error: (error) => {
                this.isLoading = false;
                this.showMessage('Error al actualizar el canal');
                console.error('Error:', error);
            }
        });
    }

    onCancel() {
        this.router.navigate(['/channels/channel']);
    }

    private showMessage(message: string) {
        this.snackBar.open(message, 'Cerrar', {
            duration: 3000
        });
    }

    onAction(action: string, row: any) {
        //('edito')
    }
}