import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';

@Component({
  selector: 'app-phone-verification',
  imports: [FormsModule],
  templateUrl: './phone-verification.html',
  styleUrl: './phone-verification.css',
})
export class PhoneVerification implements OnInit{
  otp:string = '';
  userName: string | null = localStorage.getItem('userName');
  phone: string | null = localStorage.getItem('phoneForVerification');
  constructor(private router : Router, private authservice: Authservice){}
  ngOnInit(): void {
      this.sendOtpThroughPhoneForUserVerification();
  }
resendCode(){
  this.sendOtpThroughPhoneForUserVerification();
}
verifyCode(){
  this.authservice.verifyPhoneOtp(this.phone || '', this.otp || '').subscribe(
    response => {
      console.log('OTP verified successfully:', response);
         if(localStorage.getItem('isEmailVerified') === 'true'){
        this.router.navigate(['/login']);
    } else{
      this.router.navigate(['/verify-email']);
    }
    },
    error => {
      console.error('Error verifying OTP:', error);
    }
  );
}
sendOtpThroughPhoneForUserVerification() {
  this.authservice.sendOtpEmail(this.phone || '', this.userName || '').subscribe(
    response => {
      console.log('OTP sent to phone:', response);
    },
    error => {
      console.error('Error sending OTP to phone:', error);
      alert('Failed to send OTP. Please try again later.');
    }
  );
}

}
