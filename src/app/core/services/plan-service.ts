import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { plansResponseModel } from '../Models/planModel';
import { Authservice } from './authservice';
import { genericResponseMessage } from '../Models/genericResponseModels';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private httpClient: HttpClient, private router: Router, private authservice: Authservice) { }
   planService_Base_URL : string= "http://localhost:8080/fitStudio/plan-service/plan"

   
    getAllPlans(): Observable<{ responseDtoList: plansResponseModel[] }> {
      const url = `${this.planService_Base_URL}/all/getPlans`
    return this.httpClient.get<{ responseDtoList: plansResponseModel[] }>(url);
  }

  getDiscount(cuponCode:string){

  }

  private payementUrl = 'http://localhost:8080/fitStudio/payment-service'

  buyPlan(request: any): Observable<genericResponseMessage> {
    const url = `${this.payementUrl}/all/buyPlan`
    return this.httpClient.post<genericResponseMessage>(url, request);
  }
}
