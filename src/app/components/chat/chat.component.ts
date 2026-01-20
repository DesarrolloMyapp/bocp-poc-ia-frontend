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
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TablerIconsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() isFullScreen: boolean = true;
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

  ngOnInit() {
    if (this.isFullScreen) {
      this.isOpen = true;
    }
  }

  toggleChat() {
    if (!this.isFullScreen) {
      this.isOpen = !this.isOpen;
    }
  }

  toggleAttachments() {
    this.showAttachments = !this.showAttachments;
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
          url: e.target.result, // base64 data url
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
    // Reemplazar "- " al inicio de línea (o después de <br>) con un bullet point visual
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

  sendMessage() {
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
      this.callBedrockAPI(userMessage, attachments);
    }
  }

  callBedrockAPI(message: string, attachments: Attachment[] = []) {
    this.isProcessing = true;
    
    const apiUrl = `${environment.api}bedrock/prompt`;
    
    const payload: any = {
      prompt: message || '', // Asegurar que no sea null
      userId: environment.userId,
      agentId: environment.agentId,
      agentAliasId: environment.agentAliasId,
      fileIds: []
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(attachment => {
          // Determine mime type
          let mediaType = 'application/octet-stream';
          if (attachment.type === 'pdf') mediaType = 'application/pdf';
          else if (attachment.type === 'excel') mediaType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // xlsx
          else if (attachment.type === 'image') {
            const extension = attachment.name.split('.').pop()?.toLowerCase();
            if (extension === 'png') mediaType = 'image/png';
            else if (extension === 'jpg' || extension === 'jpeg') mediaType = 'image/jpeg';
            else if (extension === 'webp') mediaType = 'image/webp';
            else mediaType = 'image/jpeg'; // fallback
          }
          
          return {
            base64: attachment.url, // Backend expects full base64 string (including prefix is fine, handled by backend)
            fileName: attachment.name,
            fileType: mediaType
          };
      });
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
        
        // Agregar la respuesta del bot
        this.messages.push({
          text: botResponse,
          sender: 'bot',
          time: new Date()
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
}
