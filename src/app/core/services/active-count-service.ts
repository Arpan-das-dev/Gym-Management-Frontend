import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveCountService {
  constructor(private httpClient : HttpClient){}

  // Member APIs
  private memberCountUrl = 'http://localhost:8080/fitStudio/member-service/count';

  memberIncrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.memberCountUrl}/increment?id=${id}`, {});
  }

  memberDecrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.memberCountUrl}/decrement?id=${id}`, {});
  }

  memberGetActiveCount(): Observable<number> {
    return this.httpClient.get<number>(`${this.memberCountUrl}/active-count`);
  }

  // Trainer APIs
  private trainerCountUrl = 'http://localhost:8080/fitStudio/trainer-service/count';

  trainerIncrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.trainerCountUrl}/increment?id=${id}`, {});
  }

  trainerDecrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.trainerCountUrl}/decrement?id=${id}`, {});
  }

  trainerGetActiveCount(): Observable<number> {
    return this.httpClient.get<number>(`${this.trainerCountUrl}/active-count`);
  }

  // Admin APIs
  private adminCountUrl = 'http://localhost:8080/fitStudio/admin-service/count';

  adminIncrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.adminCountUrl}/increment?id=${id}`, {});
  }

  adminDecrement(id: string): Observable<any> {
    return this.httpClient.post(`${this.adminCountUrl}/decrement?id=${id}`, {});
  }

  adminGetActiveCount(): Observable<number> {
    return this.httpClient.get<number>(`${this.adminCountUrl}/active-count`);
  }


   

  


















}