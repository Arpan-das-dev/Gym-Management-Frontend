import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { emailVerificationModel, loginModel, loginResponse } from '../Models/loginModels';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, tap, Observable } from 'rxjs';
import { signupModel, userDetailModel } from '../Models/signupModel';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { jwtPayload } from '../Models/jwtModel';
@Injectable({
  providedIn: 'root'
})
export class Authservice {
  authServiceLoginUrl = "http://localhost:8080/fitStudio/auth"
  constructor(private http: HttpClient,
    private router: Router
  ) { }

  login(data: loginModel): Observable<loginResponse> {
    return this.http.post<loginResponse>(`${this.authServiceLoginUrl}/login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      }), catchError(error => {
        console.error("Login error:", error);
        return throwError(() => new Error("Login failed"));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  // utility methods
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  getUserRole(): string | null {
    const jwtToken = this.getToken();
    if (!jwtToken) {
      return null;
    }
    try {
      const decoded = jwtDecode<jwtPayload>(jwtToken);
      return decoded.role || null;
    } catch (error) {
      this.logout();
      this.router.navigate(['/login'])
      return null;
    }
  }
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (!decoded.exp) return false;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }



  // signup method 
  signup(data: signupModel): Observable<string> {
    const url = `${this.authServiceLoginUrl}/signup`;
    console.log('➡ AuthService.signup() called — HttpClient instance:', this.http);
    console.log('➡ Sending signup to:', url);
    console.log('📦 Payload:', data);
    return this.http.post<string>(url, data).pipe(
      tap(response => {
        console.log(response);
        return response;
      }), catchError(error => {
        console.error("Signup error:", error);
        return throwError(() => new Error("Signup failed"));
      })
    );
  }

  // delete account verification
  deleteAccountVerification(data: loginModel): Observable<string> {
    return this.http.post<string>(this.authServiceLoginUrl + "/delete/verify", data).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Delete account verification error:", error);
        return throwError(() => new Error("Delete account verification failed"));
      })
    );
  }

  // send otp  through email
  sendOtpEmail(email: string, name: string): Observable<string> {
    const url = `${this.authServiceLoginUrl}/emailVerification/${email}/${name}`;
    return this.http.get<string>(url).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("OTP email verification error:", error);
        return throwError(() => new Error("OTP email verification failed"));
      })
    );
  }

  // verify account through email otp
  verifyEmailOtp(email: string, otp: string): Observable<string> {
    const url = this.authServiceLoginUrl + "/verifyEmail";
    const body: emailVerificationModel = {
      email: email,
      otp: otp
    }
    return this.http.post<string>(url, body).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Email OTP verification error:", error);
        return throwError(() => new Error("Email OTP verification failed"));
      })
    );
  }
  // send otp through phone
  sendOtpPhone(phone: string, name: string): Observable<string> {
    const url = `${this.authServiceLoginUrl}/phoneVerification/${phone}/${name}`;
    return this.http.get<string>(url).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("OTP phone verification error:", error);
        return throwError(() => new Error("OTP phone verification failed"));
      })
    );
  }

  // verify account through phone otp
  verifyPhoneOtp(phone: string, otp: string): Observable<string> {
    const url = this.authServiceLoginUrl + "/verifyPhone";
    const body = {
      phone: phone,
      otp: otp
    }
    return this.http.post<string>(url, body).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Phone OTP verification error:", error);
        return throwError(() => new Error("Phone OTP verification failed"));
      })
    );
  }

  // forgot password
  forgotPassword(email: string): Observable<string> {
    const url = `${this.authServiceLoginUrl}/forgotPassword`;
    const body = {
      email: email
    }
    return this.http.post<string>(url, body).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Forgot password error:", error);
        return throwError(() => new Error("Forgot password failed"));
      })
    );
  }

  // reset password
  resetPassword(email: string, oldPassword: string, newPassword: string): Observable<string> {
    const url = `${this.authServiceLoginUrl}/resetPassword`;
    const body = {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword
    }
    return this.http.post<string>(url, body).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Reset password error:", error);
        return throwError(() => new Error("Reset password failed"));
      })
    );
  }

  // change password
  changePassword(email: string, newPassword: string): Observable<string> {
    const url = `${this.authServiceLoginUrl}/changePassword`;
    const body = {
      email: email,
      newPassword: newPassword
    }
    return this.http.post<string>(url, body).pipe(
      tap(response => {
        console.log(response);
      }), catchError(error => {
        console.error("Change password error:", error);
        return throwError(() => new Error("Change password failed"));
      })
    );
  }

  loadUserInfo(identifier: string): Observable<userDetailModel>{
    const url = `${this.authServiceLoginUrl}/userDetails?identifier=${identifier}`;
    console.log("sending request to "+url);
    return this.http.get<userDetailModel>(url).pipe();
  }
}
