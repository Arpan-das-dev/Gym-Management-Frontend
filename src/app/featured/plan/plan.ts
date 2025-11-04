import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCancel, faCheck, faClock, faComment, faDumbbell, faStar } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PlanService } from '../../core/services/plan-service';
import { plansResponseModel } from '../../core/Models/planModel';


@Component({
  selector: 'app-plan',
  imports: [Navbar, Footer, NgClass, FontAwesomeModule],
  templateUrl: './plan.html',
  styleUrl: './plan.css',
})
export class Plan implements OnInit {
  icons = {
    star: faStar,
    check: faCheck,
    dumbell: faDumbbell,
    cancel: faCancel,
    clock: faClock,
    support: faComment
  }
  constructor(private router: Router, private planService: PlanService) { }

  plans: plansResponseModel[] = [];
  errorOccurred: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadAllPlans()
  }
  private loadAllPlans() {
    this.planService.getAllPlans().subscribe({
      next :(res) => {
        console.log("✔️ response ", res);
        this.plans = res.responseDtoList || []
        console.log('Plans:', this.plans);
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
}
