import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/enviroments/environment';

interface Attachment {
  type: 'image' | 'pdf' | 'excel';
  name: string;
  url?: string;
  file?: File;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
  attachments?: Attachment[];
  apiResponse?: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TablerIconsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() isFullScreen: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  private http = inject(HttpClient);
  isProcessing: boolean = false;

  messages: Message[] = [
    { text: 'Hola, ¿en qué puedo ayudarte hoy?', sender: 'bot', time: new Date() }
  ];
  newMessage: string = '';
  isOpen: boolean = false;
  showAttachments: boolean = false;
  currentUploadType: 'pdf' | 'excel' | 'image' | null = null;
  pendingAttachments: Attachment[] = [];
  uploadedFiles: any[] = [];
  showImagePreview: boolean = false;
  previewImageUrl: string = '';
  sessionId: string = '';

  ngOnInit() {
    if (this.isFullScreen) {
      this.isOpen = true;
    }
    // Generar sessionId único para la sesión
    this.sessionId = this.generateSessionId();
  }

  toggleChat() {
    if (!this.isFullScreen) {
      this.isOpen = !this.isOpen;
    }
  }

  toggleAttachments() {
    this.showAttachments = !this.showAttachments;
  }

  openImagePreview(imageUrl: string) {
    this.previewImageUrl = imageUrl;
    this.showImagePreview = true;
  }

  closeImagePreview() {
    this.showImagePreview = false;
    this.previewImageUrl = '';
  }

  getAcceptTypes(): string {
    switch (this.currentUploadType) {
      case 'pdf': return '.pdf';
      case 'excel': return '.xlsx, .xls, .csv';
      case 'image': return 'image/*';
      default: return '*/*';
    }
  }

  handleFileUpload(type: 'pdf' | 'excel' | 'image') {
    this.currentUploadType = type;
    this.showAttachments = false;
    setTimeout(() => {
      this.fileInput.nativeElement.click();
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const attachmentType = this.currentUploadType || 'image';

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pendingAttachments.push({
          type: attachmentType,
          name: file.name,
          url: e.target.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
    this.currentUploadType = null;
  }

  removePendingAttachment(index: number) {
    this.pendingAttachments.splice(index, 1);
  }

  formatMessage(text: string): string {
    if (!text) return '';
    // Convertir **texto** a <strong>texto</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convertir saltos de línea a <br>
    formatted = formatted.replace(/\n/g, '<br>');
    // Opcional: Mejorar visualización de listas
    formatted = formatted.replace(/(^|<br>)- /g, '$1• ');
    return formatted;
  }

  simulateBotResponse() {
    setTimeout(() => {
      this.messages.push({
        text: 'Archivo recibido correctamente. Lo estoy procesando...',
        sender: 'bot',
        time: new Date()
      });
    }, 1500);
  }

  async sendMessage() {
    if (this.newMessage.trim() || this.pendingAttachments.length > 0) {
      const userMessage = this.newMessage;
      const attachments = [...this.pendingAttachments]; 
      
      const message: Message = {
        text: userMessage,
        sender: 'user',
        time: new Date()
      };

      if (attachments.length > 0) {
        message.attachments = attachments;
      }

      this.messages.push(message);
      
      this.newMessage = '';
      this.pendingAttachments = [];

      // Si hay archivos adjuntos, subirlos a S3 primero
      if (attachments.length > 0) {
        try {
          const uploadedFilesData = await this.uploadFilesToS3(attachments);
          this.callBedrockAPI(userMessage, uploadedFilesData);
        } catch (error) {
          console.error('Error al subir archivos:', error);
          this.messages.push({
            text: 'Error al cargar los archivos. Por favor, intenta de nuevo.',
            sender: 'bot',
            time: new Date()
          });
        }
      } else {
        // Si no hay archivos nuevos, enviar solo el mensaje
        this.callBedrockAPI(userMessage, []);
      }
    }
  }

  callBedrockAPI(message: string, uploadedFilesData: any[] = []) {
    this.isProcessing = true;
    
    const apiUrl = `${environment.api}bedrock/prompt`;
    
    // Preparar el payload base
    const payload: any = {
      prompt: message || '', 
      userId: environment.userId,
      agentId: environment.agentId,
      agentAliasId: environment.agentAliasId,
      sessionId: this.sessionId,
      fileIds: []
    };

    // Si hay archivos recién subidos, usar sus s3Uri
    if (uploadedFilesData && uploadedFilesData.length > 0) {
      payload.attachments = uploadedFilesData.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        s3Uri: file.s3Uri
      }));
    }
    // Si NO hay archivos nuevos pero SÍ hay uploadedFiles previos, enviar con s3Uri
    else if (this.uploadedFiles && this.uploadedFiles.length > 0) {
      payload.attachments = this.uploadedFiles.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        s3Uri: file.s3Uri
      }));
    }

    this.http.post<any>(apiUrl, payload).subscribe({
      next: (response) => {
        this.isProcessing = false;
        
        // Parsear la respuesta si viene como string
        let parsedResponse = response;
        if (typeof response === 'string') {
          try {
            parsedResponse = JSON.parse(response);
          } catch (e) {
            console.error('Error al parsear la respuesta:', e);
            parsedResponse = response;
          }
        }
        
        // Mapear la respuesta correctamente desde la estructura de la API
        const botResponse = parsedResponse.records?.response || parsedResponse.response || parsedResponse.message || 'Respuesta recibida';
        
        // Guardar uploadedFiles para reutilizar en próximas consultas
        if (parsedResponse.records?.uploadedFiles && parsedResponse.records.uploadedFiles.length > 0) {
          this.uploadedFiles = parsedResponse.records.uploadedFiles;
        }
        
        // Agregar la respuesta del bot con la respuesta completa del API
        this.messages.push({
          text: botResponse,
          sender: 'bot',
          time: new Date(),
          apiResponse: parsedResponse.records || parsedResponse
        });
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error al llamar a bedrock/prompt:', error);
        
        this.messages.push({
          text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          sender: 'bot',
          time: new Date()
        });
      }
    });
  }

  // Obtener URLs prefirmadas del backend
  async getPresignedUrls(files: Attachment[]): Promise<any> {
    const apiUrl = `${environment.api}bedrock/upload`;
    
    const filesData = files.map(file => {
      let fileType = 'application/octet-stream';
      if (file.type === 'pdf') fileType = 'application/pdf';
      else if (file.type === 'excel') fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (file.type === 'image') {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'png') fileType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
        else if (extension === 'webp') fileType = 'image/webp';
        else fileType = 'image/jpeg';
      }
      
      return {
        fileName: file.name,
        fileType: fileType
      };
    });

    const payload = {
      sessionId: this.sessionId,
      files: filesData
    };

    const response = await this.http.post<any>(apiUrl, payload).toPromise();
    
    // Parsear el body si viene como string
    if (response && response.body && typeof response.body === 'string') {
      try {
        return JSON.parse(response.body);
      } catch (e) {
        console.error('Error al parsear body:', e);
        return response;
      }
    }
    
    return response;
  }

  // Subir archivos a S3 usando URLs prefirmadas
  async uploadFilesToS3(attachments: Attachment[]): Promise<any[]> {
    try {
      // 1. Obtener URLs prefirmadas
      const response = await this.getPresignedUrls(attachments);
      
      if (!response.result || !response.records?.uploadUrls) {
        throw new Error('No se pudieron obtener las URLs prefirmadas');
      }

      const uploadUrls = response.records.uploadUrls;
      const uploadPromises: Promise<any>[] = [];

      // 2. Subir cada archivo a S3
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        const urlData = uploadUrls[i];

        if (attachment.file && urlData.uploadUrl) {
          // Convertir base64 a Blob si es necesario
          const file = attachment.file;
          
          // Subir usando PUT a la URL prefirmada
          const uploadPromise = this.http.put(urlData.uploadUrl, file, {
            headers: {
              'Content-Type': urlData.fileType
            }
          }).toPromise();

          uploadPromises.push(uploadPromise);
        }
      }

      // 3. Esperar a que todos los archivos se suban
      await Promise.all(uploadPromises);

      // 4. Guardar los datos de archivos subidos y retornarlos
      this.uploadedFiles = uploadUrls.map((url: any) => ({
        fileName: url.fileName,
        fileType: url.fileType,
        s3Uri: url.s3Uri,
        s3Url: url.s3Url,
        s3Key: url.s3Key
      }));

      return this.uploadedFiles;
    } catch (error) {
      console.error('Error en uploadFilesToS3:', error);
      throw error;
    }
  }

  // Generar un UUID para sessionId
  generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Descargar respuesta del API como JSON
  downloadJSON(message: Message) {
    if (!message.apiResponse) return;

    // Preparar el objeto JSON con la estructura completa
    const jsonData = {
      sessionId: message.apiResponse.sessionId || this.sessionId,
      timestamp: message.time.toISOString(),
      conversationId: message.apiResponse.conversationId,
      prompt: message.apiResponse.prompt || '',
      response: message.text,
      uploadedFiles: message.apiResponse.uploadedFiles || [],
      agentId: message.apiResponse.agentId,
      method: message.apiResponse.method
    };

    // Convertir a string JSON con formato legible
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Crear un Blob con el contenido JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generar nombre del archivo con timestamp
    const fileName = `analisis_${message.apiResponse.sessionId || 'chat'}_${Date.now()}.json`;
    link.download = fileName;
    
    // Ejecutar la descarga
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
