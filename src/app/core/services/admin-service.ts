import { Injectable } from '@angular/core';
import { signupModel } from '../Models/signupModel';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { genericResponseMessage, UserCreationResponseDto } from '../Models/genericResponseModels';
import { PlanCreateRequestDto } from '../Models/planModel';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient: HttpClient) { }

  userManageMentUrl = "http://localhost:8080/fitStudio/admin/auth-management";

  createMember(data: signupModel): Observable<UserCreationResponseDto> {
    const url: string = `${this.userManageMentUrl}/addMember`;
    return this.httpClient.post<UserCreationResponseDto>(url, data,{} ).pipe();
  }
  createTrainer(data: signupModel): Observable<UserCreationResponseDto> {
    const url: string = `${this.userManageMentUrl}/addTrainer`;
    // console.log(this.httpClient);
    return this.httpClient.post<UserCreationResponseDto>(url, data).pipe();
  }
  createAdmin(data: signupModel): Observable<UserCreationResponseDto> {
    const url = `${this.userManageMentUrl}/addAdmin`;
    return this.httpClient.post<UserCreationResponseDto>(url, data).pipe();
  }
  setCustomId(id: string, role: string, email: string): Observable<any> {
    const url = `${this.userManageMentUrl}/setId`
    const params = new HttpParams()
      .set('id', id).set('role', role).set('email', email);
    return this.httpClient.post<any>(url, null, { params: params });
  }
  deleteUser(id: string, role: string): Observable<string> {
    const url = `${this.userManageMentUrl}/delete`;
    const params = new HttpParams()
      .set('identifier', id).set('role', role);
    return this.httpClient.delete<string>(url, { params: params });
  }

  // managing plans via admin service
  planManagementUrl="http://localhost:8080/fitStudio/admin/plans"

  createPlan(data: PlanCreateRequestDto) : Observable<genericResponseMessage>{
    const url = `${this.planManagementUrl}/createPlan`;
    return this.httpClient.post<genericResponseMessage>(url,data);
  }
}
