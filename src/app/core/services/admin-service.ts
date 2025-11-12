import { Injectable } from '@angular/core';
import { signupModel } from '../Models/signupModel';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { genericResponseMessage, UserCreationResponseDto } from '../Models/genericResponseModels';
import { PlanCreateRequestDto, PlanUpdateRequestDto, UpdateResponseDto } from '../Models/planModel';
import { ApprovalRequestDto } from '../Models/adminServiceModels';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient: HttpClient) { }

  userManageMentUrl = "http://localhost:8080/fitStudio/admin/auth-management";

  createMember(data: signupModel): Observable<UserCreationResponseDto> {
    const url: string = `${this.userManageMentUrl}/addMember`;
    return this.httpClient.post<UserCreationResponseDto>(url, data, {}).pipe();
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
  planManagementUrl = "http://localhost:8080/fitStudio/admin/plans"

  // 1. create plan
  createPlan(data: PlanCreateRequestDto): Observable<any> {
    const url = `${this.planManagementUrl}/createPlan`;
    return this.httpClient.post<any>(url, data);
  }
  // 2. update plan
  updatePlan(planId: string, data: PlanUpdateRequestDto): Observable<any> {
    const url = `${this.planManagementUrl}/updatePlan`;
    const params = new HttpParams().set('id', planId);
    return this.httpClient.put<any>(url, data, { params }).pipe(
      tap()
    );
  }

  // 3. delete plan
  deletePlan(id: string) : Observable<any> {
    const url = `${this.planManagementUrl}/delete`;
    const params = new HttpParams().set('id',id);
    return this.httpClient.delete<any>(url,{params});
  }

  // managing approval requests
  // 1. for signup approval to continue the platform access

  approvalUrl = "http://localhost:8080/fitStudio/admin/approve"

  loadAllJoiningRequests(): Observable<any> {
    const url = `${this.approvalUrl}/getList`;
    return this.httpClient.get<any>(url);
  }

  approveUserRequest(data: ApprovalRequestDto): Observable<any> {
    const url = `${this.approvalUrl}/approved`;
    return this.httpClient.post<any>(url, data);
  }

  declienUserRequest(data: ApprovalRequestDto): Observable<any> {
    const url = `${this.approvalUrl}/declined`;
    return this.httpClient.post<any>(url, data);
  }

  // 2. for member's request to assign trainer for him/her

  loadAllMemberRequestForTrainer(): Observable<any> {
    const url = `${this.approvalUrl}/memberRequests`
    return this.httpClient.get<any>(url);
  }

  approveMemberRequest(requestId: string, eligibleDate: string): Observable<any> {
    const url = `${this.approvalUrl}/approve-memberRequest`;
    const params = { requestId, eligibleDate }
    return this.httpClient.post(url, null, { params })
  }

  declineMemberRequest(requestId: string): Observable<any> {
    const url = `${this.approvalUrl}/delete-request`;
    const params = { requestId };
    return this.httpClient.delete(url, { params });
  }

  // plan m

}
