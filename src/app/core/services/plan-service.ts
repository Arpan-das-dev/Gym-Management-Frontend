import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { plansResponseModel, PlanUpdateRequestDto } from '../Models/planModel';
import { Authservice } from './authservice';
import { genericResponseMessage } from '../Models/genericResponseModels';
import { CuponValidationResponse } from '../Models/cuponCodeModels';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private httpClient: HttpClient, private router: Router, private authservice: Authservice) { }
  planService_Base_URL: string = `${environment.apiBaseUrl}${environment.microServices.PLAN_SERVICE.BASE}`;

  planService_Base_Url_cuponCodeManagement: string = `${environment.apiBaseUrl}${environment.microServices.PLAN_SERVICE.CUPONCODE}`;

  // plan management service logics 
  //1. get all plans from backend
  getAllPlans(): Observable<any> {
    const url = `${this.planService_Base_URL}/all/getPlans`
    return this.httpClient.get(url);
  }

  //2. update plans

  getDiscount(cuponCode: string, planId: string): Observable<CuponValidationResponse> {
    const url = `${this.planService_Base_Url_cuponCodeManagement}/all/validateCuponCode`;
    const params = new HttpParams().set('cuponCode', cuponCode).set('planId', planId);
    return this.httpClient.post<CuponValidationResponse>(url, null, { params });
  }



  private payementUrl = `${environment.apiBaseUrl}${environment.microServices.PLAN_SERVICE.PAYMENT}`;

  buyPlan(request: any): Observable<genericResponseMessage> {
    const url = `${this.payementUrl}/all/createOrder`
    return this.httpClient.post<genericResponseMessage>(url, request);
  }

  confirmPayment(request: any): Observable<genericResponseMessage> {
    const url = `${this.payementUrl}/all/confirmPayment`;
    return this.httpClient.post<genericResponseMessage>(url, request);
  }

  /**
   * this below section is for admin to get 
   * all stats and data related to monthly revenue
   */
  private planMatricesUrl = "http://localhost:8080/fitStudio/payment-service/matrices";

  getActivePlanUserCount(planId: string): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/activeUser`;
    const params = { planId };
    return this.httpClient.get<any>(url, { params });
  }

  getMostPopularPlan(): Observable<any> {
    const url = `${this.planMatricesUrl}/all/mostPopular`;
    return this.httpClient.get<any>(url).pipe(
      tap(response => {

        console.log('Most popular plans response:');
        console.log(response.planIds);
        
      }   
    ));
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

  getYearList () : Observable <any> {
    const url = `${this.planMatricesUrl}/admin/yearRange`;
    return this.httpClient.get<any>(url)
  }
  getRevenuePerMonth(year : number): Observable<any> {
    const url = `${this.planMatricesUrl}/admin/revenuePerMonth/${year}`
    return this.httpClient.get(url)
  }

  getReveneueGeneratedByEachePlan() : Observable<any> {
    const url = `${this.planMatricesUrl}/admin/getAllPlanRevenue`;
    return this.httpClient.get(url)
  }
  getLifetimeIncome() : Observable<any> {
    const url = `${this.planMatricesUrl}/admin/LifeTimeIncome`;
    return this.httpClient.get(url)
  }
  getQuickStats() : Observable<any> {
    const url = `${this.planMatricesUrl}/admin/quickStats`;
    return this.httpClient.get(url)
  }
  // get all public cupons
  getAllPublicCupons(): Observable<any> {
    const url = `${this.planService_Base_Url_cuponCodeManagement}/all/getAll`;
    return this.httpClient.get<any>(url);
  }

  
  
}
