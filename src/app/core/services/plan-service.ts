import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { plansResponseModel, PlanUpdateRequestDto } from '../Models/planModel';
import { Authservice } from './authservice';
import { genericResponseMessage } from '../Models/genericResponseModels';
import { CuponValidationResponse } from '../Models/cuponCodeModels';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private httpClient: HttpClient, private router: Router, private authservice: Authservice) { }
  planService_Base_URL: string = "http://localhost:8080/fitStudio/plan-service/plan"

  planService_Base_Url_cuponCodeManagement: string = "http://localhost:8080/fitStudio/plan-service/cupon"

  // plan management service logics 
  //1. get all plans from backend
  getAllPlans(): Observable<{ responseDtoList: plansResponseModel[] }> {
    const url = `${this.planService_Base_URL}/all/getPlans`
    return this.httpClient.get<{ responseDtoList: plansResponseModel[] }>(url);
  }


  //2. update plans


  getDiscount(cuponCode: string): Observable<CuponValidationResponse> {
    const url = `${this.planService_Base_Url_cuponCodeManagement}/all/validateCuponCode`;
    const params = { cuponCode: cuponCode };
    return this.httpClient.post<CuponValidationResponse>(url, null, { params });
  }



  private payementUrl = 'http://localhost:8080/fitStudio/payment-service'

  buyPlan(request: any): Observable<genericResponseMessage> {
    const url = `${this.payementUrl}/all/createOrder`
    return this.httpClient.post<genericResponseMessage>(url, request);
  }

  confirmPayment(request: any): Observable<genericResponseMessage> {
    const url = `${this.payementUrl}/all/confirmPayment`;
    return this.httpClient.post<genericResponseMessage>(url, request);
  }

  private planMatricesUrl = "http://localhost:8080/fitStudio/payment-service/matrices";

  getActivePlanUserCount(planId: string): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/activeUser`;
    const params = { planId };
    return this.httpClient.get<any>(url, { params });
  }

  getMostPopularPlan(): Observable<any> {
    const url = `${this.planMatricesUrl}/all/mostPopular`;
    return this.httpClient.get<any>(url);
  }

  getTotalUserForAllPlans(): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/totalUsers`;
    console.log("sending req to " + url);
    return this.httpClient.get<any>(url);
  }

  getMonthlyRevenue(): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/monthlyRevenue`;
    return this.httpClient.get<any>(url);
  }

  getRevenewPerMonth(pageSize: number, pageNo: number): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/revenuePerMonth`
    const params = { pageSize, pageNo }
    return this.httpClient.get(url, { params })
  }
}
