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

    if (this.currentUploadType === 'image') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.messages.push({
          text: '',
          sender: 'user',
          time: new Date(),
          attachment: {
            type: 'image',
            name: file.name,
            url: e.target.result,
            file: file
          }
        });
        this.simulateBotResponse();
      };
      reader.readAsDataURL(file);
    } else {
      this.messages.push({
        text: '',
        sender: 'user',
        time: new Date(),
        attachment: {
          type: this.currentUploadType!,
          name: file.name,
          file: file
        }
      });
      this.simulateBotResponse();
    }

    // Reset input
    event.target.value = '';
    this.currentUploadType = null;
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
    if (this.newMessage.trim()) {
      const userMessage = this.newMessage;
      
      this.messages.push({
        text: userMessage,
        sender: 'user',
        time: new Date()
      });
      
      this.newMessage = '';
      this.callBedrockAPI(userMessage);
    }
  }

  callBedrockAPI(message: string) {
    this.isProcessing = true;
    
    const apiUrl = `${environment.api}bedrock/prompt`;
    const payload = {
      prompt: message,
      userId: environment.userId,
      agentId: environment.agentId,
      agentAliasId: environment.agentAliasId
    };

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
