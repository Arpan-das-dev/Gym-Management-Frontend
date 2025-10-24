import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loginModel, loginResponse } from '../Models/loginModels';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, tap,Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  authServiceLoginUrl = "http://localhost:8080/fitStudio/auth/login"
  constructor(private http: HttpClient) {}

 login(data : loginModel): Observable<loginResponse> {
  return this.http.post<loginResponse>(this.authServiceLoginUrl,data).pipe(
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
}
