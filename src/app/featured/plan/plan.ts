import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCancel, faCheck, faCheckCircle, faClock, faCog, faComment, faDumbbell, faExclamationCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PlanService } from '../../core/services/plan-service';
import { plansResponseModel } from '../../core/Models/planModel';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../core/Models/errorResponseModel';


@Component({
  selector: 'app-plan',
  imports: [Navbar, Footer, NgClass, FontAwesomeModule],
  templateUrl: './plan.html',
  styleUrl: './plan.css',
})
export class Plan implements OnInit {
    loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  globalLoadinText = 'loading';
  icons = {
    cog:faCog,
    star: faStar,
    check: faCheck,
    dumbell: faDumbbell,
    cancel: faCancel,
    clock: faClock,
    support: faComment,
    checkCircle: faCheckCircle,
        exclamationCircle: faExclamationCircle,
  }
  constructor(private router: Router, private planService: PlanService) { }

  plans: plansResponseModel[] = [];
  errorOccurred: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadAllPlans()
  }
  private loadAllPlans() {
    this.loading = true;
    this.globalLoadinText = "Loading Plan's Info"
    this.planService.getAllPlans().subscribe({
      next :(res) => {
        console.log("✔️ response ", res);
        this.plans = res.responseDtoList || []
        console.log('Plans:', this.plans);
        this.loading = false;
        this.showSuccess("Successfully Fetched all Plans")
      }, error:(err:HttpErrorResponse) =>{
        this.loading = false
        console.log(err);
        this.catchError(err,"Failed to Load All PLans Due to Internal Server Error")
      }
    })
  }
  buyPlan(planId: string) { 
    const plan : plansResponseModel | undefined = this.plans.find(p => p.planId === planId);
    if(plan){
    this.router.navigate(['/buyPlan'], {state :{plan}});
    } else{
      this.errorOccurred = true;
      this.errorMessage = "Something went wrong please try again later"
    }
  }
  isPopular(planId: string): boolean {
    return true;
  }
    catchError(err: HttpErrorResponse, defaultMsg: string) {
    this.loading = false;
    const errorBody: erroResponseModel | undefined = err.error;
    let messageToShow = defaultMsg;
    if (errorBody && errorBody.message) {
      messageToShow = errorBody.message;
      console.log('Backend Error Message:', messageToShow);
    } else {
      messageToShow = err.message || messageToShow;
      console.error('Unknown error structure:', err);
    }
    this.showError(messageToShow);
  }

  showSuccess(msg: string) {
    this.messageType = 'success';
    this.messageText = msg;
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 2500);
  }

  showError(msg: string) {
    this.messageType = 'error';
    this.messageText = msg;
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 2500);
  }
}
