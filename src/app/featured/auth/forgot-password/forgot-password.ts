import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email: string = '';
  userName: string = localStorage.getItem('userName') || 'User';
  otp: string = '';
  loading = false;
  showOtpField = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: Authservice, private router: Router) { }

  sendResetCode() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.sendOtpEmail(this.email || '', this.userName || '').subscribe({
      next: () => {
        this.loading = false;
        this.showOtpField = true;
        this.successMessage = 'A 6-digit reset code has been sent to your email.';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to send code. Please check your email and try again.';
        console.error(error);
      },
    });
  }

  resendCode() {
    this.sendResetCode();
  }

  verifyCode() {
    this.authService.verifyEmailOtp(this.email, this.otp).subscribe({
      next: () => {
        this.successMessage = 'Code verified successfully. Redirecting...';
        setTimeout(() => this.router.navigate(['/reset-password'],
          {queryParams:{email:this.email}}
        ), 1500);
      },
      error: () => {
        this.errorMessage = 'Invalid or expired code. Please try again.';
      },
    });
  }

}
