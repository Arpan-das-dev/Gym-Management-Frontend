import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  imports: [FormsModule],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.css',
})
export class EmailVerification implements OnInit{
email: string | null = localStorage.getItem('emailForVerification');
userName: string | null = localStorage.getItem('userName');
otp:string = ''
constructor(private router: Router, private authservice: Authservice){}
sendOtpThroughEmailForUserVerification(){
  this.authservice.sendOtpEmail(this.email || '', this.userName || '').subscribe();
}
resendCode(){
  this.sendOtpThroughEmailForUserVerification();
}
verifyCode(){
  console.log(this.otp);
  
  this.authservice.verifyEmailOtp(this.email || '', this.otp).subscribe(
    {
      next: (response) => {
        console.log(response);
        localStorage.setItem('isEmailVerified', 'true');
        this.router.navigate(['/verify-phone']);
      },
      error: (error) => {
        alert("Invalid OTP. Please try again.");
        console.error('OTP verification failed', error);
      }
    }
  );
}
ngOnInit(): void {
  this.sendOtpThroughEmailForUserVerification();
}
}
