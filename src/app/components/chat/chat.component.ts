import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/enviroments/environment';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
  attachment?: {
    type: 'image' | 'pdf' | 'excel';
    name: string;
    url?: string;
    file?: File;
  };
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
  pendingAttachment: any = null;

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
    const file = event.target.files[0];
    if (!file) return;

    const attachmentType = this.currentUploadType || 'image';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.pendingAttachment = {
        type: attachmentType,
        name: file.name,
        url: e.target.result,
        file: file
      };
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
    this.currentUploadType = null;
  }

  removePendingAttachment() {
    this.pendingAttachment = null;
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
    if (this.newMessage.trim() || this.pendingAttachment) {
      const userMessage = this.newMessage;
      const attachment = this.pendingAttachment; 
      
      const message: Message = {
        text: userMessage,
        sender: 'user',
        time: new Date()
      };

      if (this.pendingAttachment) {
        message.attachment = this.pendingAttachment;
      }

      this.messages.push(message);
      
      this.newMessage = '';
      this.pendingAttachment = null;
      this.callBedrockAPI(userMessage, attachment);
    }
  }

  callBedrockAPI(message: string, attachment: any = null) {
    this.isProcessing = true;
    
    const apiUrl = `${environment.api}bedrock/prompt`;
    
    const payload: any = {
      prompt: message || '', // Asegurar que no sea null
      userId: environment.userId,
      agentId: environment.agentId,
      agentAliasId: environment.agentAliasId,
      fileIds: []
    };

    if (attachment) {
      // Extraer solo la parte base64 (eliminar el prefijo data:xxx;base64,)
      const base64Content = attachment.url.split(',')[1];
      
      payload.base64File = base64Content;
      payload.fileName = attachment.name;
      
      // Mapear tipos MIME
      let mediaType = 'application/octet-stream';
      if (attachment.type === 'pdf') mediaType = 'application/pdf';
      else if (attachment.type === 'excel') mediaType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // xlsx
      else if (attachment.type === 'image') {
        const extension = attachment.name.split('.').pop()?.toLowerCase();
        if (extension === 'png') mediaType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') mediaType = 'image/jpeg';
      }
      
      payload.mediaType = mediaType;
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
