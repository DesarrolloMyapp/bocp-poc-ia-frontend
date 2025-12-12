import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

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
  imports: [CommonModule, FormsModule, MaterialModule, TablerIconsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() isFullScreen: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;

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
      this.messages.push({
        text: this.newMessage,
        sender: 'user',
        time: new Date()
      });
      
      this.simulateBotResponse();

      this.newMessage = '';
    }
  }
}
