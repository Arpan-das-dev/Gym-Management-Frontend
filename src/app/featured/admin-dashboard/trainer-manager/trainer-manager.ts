import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCogs, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-trainer-manager',
  imports: [FontAwesomeModule,NgClass],
  templateUrl: './trainer-manager.html',
  styleUrl: './trainer-manager.css',
})
export class TrainerManager {
showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
  // boolean values for better ui and animations
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
    icons = {
      cogs: faCogs,
      checkCircle: faCheckCircle,
      exclamationCircle: faExclamationCircle,
    }
}
