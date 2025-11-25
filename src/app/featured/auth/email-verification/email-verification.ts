import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { FormsModule } from '@angular/forms';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCogs, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-email-verification',
  imports: [FormsModule, CommonModule,FontAwesomeModule],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.css',
})
export class EmailVerification implements OnInit {

  icons = {
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
  };

  email: string | null = sessionStorage.getItem('emailForVerification');
  userName: string | null = sessionStorage.getItem('userName');

  otp: string = '';

  missingEmail: boolean = false;
  manualEmail: string = '';

  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private router: Router, private authservice: Authservice) { }

  showFullScreenMessage(type: 'success' | 'error', text: string) {
    console.log("[Message]", type, text);
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  ngOnInit(): void {
    console.log("=== Email Verification Init ===");
    console.log("Session email:", this.email);
    console.log("Session username:", this.userName);

    // Check fallback from authservice
    if (!this.email || this.email.trim() === '') {
      console.log("No session email found → checking authservice.getUserMail()");
      const fromService = this.authservice.getUserMail();
      console.log("Authservice email returned:", fromService);

      if (fromService && fromService.trim() !== '') {
        this.email = fromService;
      }
    }

    // Still no email → show manual entry
    if (!this.email || this.email.trim() === '') {
      console.log("Email missing after all checks → enabling manual email input");
      this.missingEmail = true;
      return;
    }

    console.log("Final email to use:", this.email);

    // Auto send OTP
    this.sendOtp();
  }

  submitManualEmail() {
    console.log("Manual email submitted:", this.manualEmail);

    if (!this.manualEmail || this.manualEmail.trim() === '') {
      this.showFullScreenMessage('error', "Please enter a valid email");
      return;
    }

    this.email = this.manualEmail.trim();
    console.log("Manual email stored:", this.email);

    sessionStorage.setItem("emailForVerification", this.email);
    this.missingEmail = false;

    this.sendOtp();
  }

  sendOtp() {
    console.log("Sending OTP to:", this.email, "User:", this.userName);

    this.loading = true;

    this.authservice.sendOtpEmail(this.email || '', this.userName || 'User')
      .subscribe({
        next: (res: genericResponseMessage) => {
          console.log("OTP Send Success:", res);
          this.loading = false;
          this.showFullScreenMessage('success', res.message || "OTP sent to your email");
        },
        error: (err: erroResponseModel) => {
          console.log("OTP Send Failed:", err);
          this.loading = false;
          this.showFullScreenMessage('error', err.message || "Failed to send OTP");
        }
      });
  }

  resendCode() {
    console.log("Resend OTP triggered");
    this.sendOtp();
  }

  verifyCode() {
    console.log("Verifying OTP:", this.otp);

    if (!this.otp || this.otp.length < 6) {
      console.log("Invalid OTP input:", this.otp);
      this.showFullScreenMessage('error', "Please enter a valid 6-digit OTP");
      return;
    }

    this.loading = true;

    this.authservice.verifyEmailOtp(this.email || '', this.otp).subscribe({
      next: (response: genericResponseMessage) => {
        console.log("OTP verification success:", response);
        this.loading = false;

        this.showFullScreenMessage('success', response.message || "Email verified successfully");

        sessionStorage.setItem('isEmailVerified', 'true');

        // Check phone verification status
        const phoneVerified = this.authservice.isPhoneVerifed();
        console.log("Phone verified:", phoneVerified);

        if (!phoneVerified) {
          const phone = sessionStorage.getItem('phoneForVerification');
          console.log("Phone not verified → sending phone OTP to:", phone);

          if (phone) {
            this.authservice.sendOtpPhone(phone, this.userName || 'User');
          }

          this.router.navigate(['/verify-phone']);
          return;
        }

        console.log("Redirecting to home (email + phone verified)");
        this.router.navigate(['home']);
      },

      error: (error: erroResponseModel) => {
        console.log("OTP verification failed:", error);
        this.loading = false;
        this.showFullScreenMessage('error', error.message || "Invalid OTP. Please try again.");
      }
    });
  }
}
