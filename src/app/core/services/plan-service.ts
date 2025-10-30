import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { plansResponseModel } from '../Models/planModel';
import { Authservice } from './authservice';

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
}
