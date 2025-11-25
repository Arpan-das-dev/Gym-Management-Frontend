import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { CookieService } from 'ngx-cookie-service';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgClass } from '@angular/common';
import { faCheckCircle, faCogs, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-phone-verification',
  imports: [FormsModule, FontAwesomeModule, NgClass, FormsModule],
  templateUrl: './phone-verification.html',
  styleUrl: './phone-verification.css',
})
export class PhoneVerification implements OnInit {

  icons = {
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
  };

  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';

  otp: string = '';
  userName: string | null = sessionStorage.getItem('userName');
  phone: string | null = sessionStorage.getItem('phoneForVerification');

  phonePresent: boolean = true;

  constructor(
    private router: Router,
    private authservice: Authservice,
    private cookie: CookieService
  ) {}

  ngOnInit(): void {
    // first try session phone, otherwise cookie phone
    const phoneNo = this.phone || this.cookie.get('userPhone');

    if (!phoneNo) {
      this.phonePresent = false;
      return;
    }

    this.phone = phoneNo;
    this.sendOtpThroughPhoneForUserVerification();
  }

  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  resendCode() {
    this.sendOtpThroughPhoneForUserVerification();
  }

  verifyCode() {

    if (!this.otp || this.otp.length !== 6) {
      this.showFullScreenMessage('error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    this.loading = true;

    this.authservice.verifyPhoneOtp(this.phone!, this.otp).subscribe({
      next: response => {
        this.loading = false;

        this.showFullScreenMessage('success', 'Phone verified successfully!');

        // If email already verified, go login
        if (sessionStorage.getItem('isEmailVerified') === 'true') {
          this.router.navigate(['/login']);
        }else if(this.authservice.isLoggedIn()) {
          this.router.navigate(['home'])
        } 
        else {
          this.router.navigate(['/verify-email']);
        }
      },
      error: err => {
        this.loading = false;
        this.showFullScreenMessage('error', err.message || 'Invalid OTP');
      }
    });
  }

  sendOtpThroughPhoneForUserVerification() {

    const phoneNo = this.phone || this.cookie.get('userPhone');
    const user = this.userName || this.authservice.getUserName() || 'User';

    if (!phoneNo) {
      this.phonePresent = false;
      return;
    }

    this.loading = true;

    this.authservice.sendOtpPhone(phoneNo, user).subscribe({
      next: (res: genericResponseMessage) => {
        this.loading = false;
        this.showFullScreenMessage('success', res.message || "OTP sent successfully");
      },
      error: (err: erroResponseModel) => {
        this.loading = false;
        this.showFullScreenMessage('error', err.message || "Failed to send OTP");
      }
    });
  }
}

