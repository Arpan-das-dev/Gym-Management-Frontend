import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageOrReportNotificationRequestDto } from './Models/mailModel';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  
  constructor(private http: HttpClient) { }
  private notificationServiceMessageUrl = "http://localhost:8080/fitStudio/notification/message"
  sendMail(toEmail: string, subject: string, message: string) {
    const payload:MessageOrReportNotificationRequestDto = {
      sendTo: toEmail,
      subject: subject,
      message: message
    };
    return this.http.post<any>(`${this.notificationServiceMessageUrl}/sendMail`, payload);
  }

}
