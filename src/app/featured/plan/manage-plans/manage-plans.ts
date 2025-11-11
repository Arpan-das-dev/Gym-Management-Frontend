import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../../core/services/plan-service';
import { plansResponseModel, PlanUpdateRequestDto } from '../../../core/Models/planModel';
import { AdminService } from '../../../core/services/admin-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-plans',
  imports: [],
  templateUrl: './manage-plans.html',
  styleUrl: './manage-plans.css',
})
export class ManagePlans implements OnInit {
  constructor(private planService : PlanService, private adminService: AdminService, private router : Router){}
  ngOnInit(): void {
      this.loadAllPlans()
  }

  // populating all plans from backend 
  plans: plansResponseModel[] = [];

  loadAllPlans(){
    this.planService.getAllPlans().subscribe({
      next:(res) =>{
        console.log("✔️ response ", res);
        this.plans = res.responseDtoList || []
        console.log('Plans:', this.plans);
      }
    })
  }


  // update plans as per requirements
  request: PlanUpdateRequestDto = {
    id : '',
    planName : '',
    duration : 0,
    features : [],
    price: 0.00
    }

    successMessage : string = ''
    errorMessage: string = ''
    updatePlan(planId: string, data: PlanUpdateRequestDto) {
      this.adminService.updatePlan(planId, data);
    }
}
