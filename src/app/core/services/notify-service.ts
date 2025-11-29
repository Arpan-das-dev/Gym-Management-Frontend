import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  
  private notificationSubject = new BehaviorSubject <NotificationData | null> (null);
  notification$ = this.notificationSubject.asObservable();
  
    showSuccess(message: string) {
    this.notificationSubject.next({ message, type: 'success' });
  }

  showError(message: string) {
    this.notificationSubject.next({ message, type: 'error' });
  }

  clear() {
    this.notificationSubject.next(null);
  }
}
export interface NotificationData {
  message: string;
  type: 'success' | 'error';
}