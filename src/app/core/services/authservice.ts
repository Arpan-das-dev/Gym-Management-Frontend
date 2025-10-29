import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { emailVerificationModel, loginModel, loginResponse } from '../Models/loginModels';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, tap,Observable } from 'rxjs';
import { signupModel } from '../Models/signupModel';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  authServiceLoginUrl = "http://localhost:8080/fitStudio/auth"
  constructor(private http: HttpClient,
    private router: Router
  ) {}

 login(data : loginModel): Observable<loginResponse> {
  return this.http.post<loginResponse>(this.authServiceLoginUrl+"/login",data).pipe(
    tap(response=>{
      localStorage.setItem('token',response.token);
      localStorage.setItem('role',response.role);
    }), catchError(error=>{
      console.error("Login error:", error);
      return throwError(()=> new Error("Login failed"));
    })
  );
 }

 logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
 }

 // utility methods
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }


  // signup method 
  signup(data: signupModel) :Observable<string> {
    const url = `${this.authServiceLoginUrl}/signup`;
    console.log('➡ AuthService.signup() called — HttpClient instance:', this.http);
  console.log('➡ Sending signup to:', url);
  console.log('📦 Payload:', data);
    return this.http.post<string>(url,data).pipe(
      tap(response=>{
        console.log(response);
        return response;
      }), catchError(error=>{
        console.error("Signup error:", error);
        return throwError(()=> new Error("Signup failed"));
      })
    );
  }

  // delete account verification
  deleteAccountVerification(data: loginModel) : Observable<string> {
    return this.http.post<string>(this.authServiceLoginUrl+"/delete/verify",data).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Delete account verification error:", error);
        return throwError(()=> new Error("Delete account verification failed"));
      })
    );
  }

  // send otp  through email
  sendOtpEmail(email: string, name: string) : Observable<string> {
    const url = `${this.authServiceLoginUrl}/emailVerification/${email}/${name}`;
    return this.http.get<string>(url).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("OTP email verification error:", error);
        return throwError(()=> new Error("OTP email verification failed"));
      })
    );
  }
  
  // verify account through email otp
  verifyEmailOtp(email: string, otp: string) : Observable<string> {
    const url = this.authServiceLoginUrl+"/verifyEmail";
    const body: emailVerificationModel = {
      email: email,
      otp: otp
    }
    return this.http.post<string>(url, body).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Email OTP verification error:", error);
        return throwError(()=> new Error("Email OTP verification failed"));
      })
    );
  }
  // send otp through phone
  sendOtpPhone(phone: string, name: string) : Observable<string> {
    const url = `${this.authServiceLoginUrl}/phoneVerification/${phone}/${name}`;
    return this.http.get<string>(url).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("OTP phone verification error:", error);
        return throwError(()=> new Error("OTP phone verification failed"));
      })
    );
  }

  // verify account through phone otp
  verifyPhoneOtp(phone: string, otp: string) : Observable<string> {
    const url = this.authServiceLoginUrl+"/verifyPhone";
    const body = {
      phone: phone,
      otp: otp
    }
    return this.http.post<string>(url, body).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Phone OTP verification error:", error);
        return throwError(()=> new Error("Phone OTP verification failed"));
      })
    );
  }

  // forgot password
  forgotPassword(email: string) : Observable<string> {
    const url = `${this.authServiceLoginUrl}/forgotPassword`;
    const body ={
      email: email
    }
    return this.http.post<string>(url,body).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Forgot password error:", error);
        return throwError(()=> new Error("Forgot password failed"));
      })
    );
  }

  // reset password
  resetPassword(email: string,oldPassword:string, newPassword: string) : Observable<string> {
    const url = `${this.authServiceLoginUrl}/resetPassword`;
    const body ={
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword
    }
    return this.http.post<string>(url,body).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Reset password error:", error);
        return throwError(()=> new Error("Reset password failed"));
      })
    );
  }

  // change password
  changePassword(email: string, newPassword: string) : Observable<string> {
    const url = `${this.authServiceLoginUrl}/changePassword`;
    const body ={
      email: email,
      newPassword: newPassword
    }
    return this.http.post<string>(url,body).pipe(
      tap(response=>{
        console.log(response);
      }), catchError(error=>{
        console.error("Change password error:", error);
        return throwError(()=> new Error("Change password failed"));
      })
    );
  }
}
