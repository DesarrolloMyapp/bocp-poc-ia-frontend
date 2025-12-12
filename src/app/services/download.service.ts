import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(private http: HttpClient) { }

  /**
   * Descarga múltiples archivos y los comprime en un ZIP
   */
  async downloadAndZipFiles(processedFiles: any[], gtin: string): Promise<void> {
    const zip = new JSZip();
    
    try {
      // Crear promesas para descargar todos los archivos
      const downloadPromises = processedFiles.map(async (file) => {
        try {
          const response = await this.http.get(file.s3_url, { responseType: 'blob' }).toPromise();
          return {
            filename: file.output_filename,
            blob: response
          };
        } catch (error) {
          console.error(`Error descargando ${file.output_filename}:`, error);
          return null;
        }
      });

      // Esperar todas las descargas
      const downloadResults = await Promise.all(downloadPromises);
      
      // Agregar archivos válidos al ZIP
      downloadResults.forEach(result => {
        if (result && result.blob) {
          zip.file(result.filename, result.blob);
        }
      });

      // Verificar si hay archivos para comprimir
      if (Object.keys(zip.files).length === 0) {
        throw new Error('No se pudieron descargar archivos válidos');
      }

      // Generar y descargar el ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFilename = `${gtin}_imagenes_procesadas.zip`;
      
      saveAs(zipBlob, zipFilename);
      
    } catch (error) {
      console.error('Error creando el ZIP:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo individual
   */
  async downloadSingleFile(url: string, filename: string): Promise<void> {
    try {
      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
      if (response) {
        saveAs(response, filename);
      }
    } catch (error) {
      console.error(`Error descargando ${filename}:`, error);
      throw error;
    }
  }
} 