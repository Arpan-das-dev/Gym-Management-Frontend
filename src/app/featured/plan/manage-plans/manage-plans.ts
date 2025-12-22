import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../../core/services/plan-service';
import { plansResponseModel, PlanUpdateRequestDto } from '../../../core/Models/planModel';
import { AdminService } from '../../../core/services/admin-service';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCheckCircle, faCogs, faEdit, faExclamationCircle, faPlus, faPlusCircle, faRocket, faTicket, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CreateCuponCodeRequestDto } from '../../../core/Models/cuponCodeModels';
import { NgClass } from '@angular/common';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manage-plans',
  imports: [FontAwesomeModule, FormsModule,NgClass],
  templateUrl: './manage-plans.html',
  styleUrl: './manage-plans.css',
})
export class ManagePlans implements OnInit {
  constructor(private planService: PlanService, private adminService: AdminService, private router: Router) { }
  ngOnInit(): void {
    this.loadAllPlans()
  }

  // icons required in the page from fontawesome library
  icons = {
    xmark: faXmark,
    plus : faPlus,
    edit: faEdit,
    ticket: faTicket,
    trash: faTrash,
    check: faCheck,
    plusCircle: faPlusCircle,
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    launch: faRocket
  }

  // global fake loading ts 
  showFakeLoading(callback: () => void) {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      callback();
    }, 5000);
  }
  // global massage showing methods
  showFullScreenMessage(type: 'success' | 'error', text: string) {
  this.messageType = type;
  this.messageText = text;
  this.showMessage = true;
  setTimeout(() => {
    this.showMessage = false;
  }, 3000);
}
  // boolean values for better ui and animations
  loading = false;
  showCouponPopup = false;
  showDeletePopup = false;
  selectedPlanId: string | null = null;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';

  // required models
  cuponCode: CreateCuponCodeRequestDto = {
    cuponCode: '',
    offPercentage: 0.0,
    validFrom:'',
    validity: '',
    access: '',
    description: ''
  }


  // below methods are used for mangement for plans by admin all method's internal 
  // methods are defined in admin service's plan managment section

  plans: UiPlan[] = []
  planUserCounts : planUserCount[] = []
  // 1. populating all plans from backend 
  loadAllPlans() {
    this.planService.getAllPlans().subscribe({
      next: (res) => {
        console.log("✔️ response ", res);
        this.plans = res.responseDtoList || []
        
        console.log('Plans:', this.plans);
      }
    })
  }

  getActiveUsersCount(planId : string){

  }
getTotalUsersCount(planId: string){

}

  // ** remove feature during plan editon
  removeFeature(planId: string, index: number) {
    const plan = this.plans.find((p) => p.planId === planId);
    if (plan) plan.planFeatures.splice(index, 1);
  }

  // ** add new feature in the plan
  addFeature(planId: string) {
  const plan = this.plans.find((p) => p.planId === planId);
  if (plan && plan.editMode) {
    if (plan.planFeatures.length === 0 || plan.planFeatures[plan.planFeatures.length - 1].trim() !== '') {
      plan.planFeatures.push('');
    } else {
      this.showFullScreenMessage('error', 'Please fill the previous feature first!');
    }
  }
}

  // ** toggle edit for  allow admin to actually edit plans
  toggleEdit(plan: any) {
    plan.editMode = !plan.editMode;
  }

  // ** toggle close the edit option and ui became agin read only
  cancelEdit(plan: any) {
    plan.editMode = false;
  }
  savePlan(plan: plansResponseModel) {
    this.loading = true;
  const dto: PlanUpdateRequestDto = {
    id: plan.planId,
    planName: plan.planName,
    price: plan.price,
    duration: plan.duration,
    features: plan.planFeatures,
  };

  this.adminService.updatePlan(plan.planId, dto).subscribe({
    next: (res:genericResponseMessage) => {
      // When response arrives, show fake loading first
      
        // After loading finishes, show success message and load plans
        console.log(res);
        this.loading = false;
        this.showFullScreenMessage('success',res.message ||'Plan updated successfully!');
        this.loadAllPlans();
      
    },
    error: (err:erroResponseModel) => {
      console.log(err);
      // On error, optionally show fake loading or directly show error message
      this.loading = false;
        this.showFullScreenMessage('error', err.message ||'Failed to update plan.');
    },
  });
}
// delete plan
confirmDelete() {
  if (this.selectedPlanId) {
    // Send request to backend
    this.loading = true;
    console.log(this.cuponCode);
    
    this.adminService.deletePlan(this.selectedPlanId!).subscribe({
      next: (res: genericResponseMessage) => {
        // On success, show success message and close popup
        console.log(res);
        this.loading = false;
        this.showFullScreenMessage('success', res.message || 'Plan deleted successfully!');
        this.closeDeletePopup();
        this.loadAllPlans()
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to delete plan';
        this.showFullScreenMessage('error', message);
        this.closeDeletePopup();
      }
    });
  }
}


  // cupon code ui and mangement

  // 1. cupon popups
  // ** close popup
  closeCouponPopup() {
    this.showCouponPopup = false;
    this.cuponCode.cuponCode = '',
      this.cuponCode.offPercentage = 0.0,
      this.cuponCode.validity = ''
  }
  // ** open popup
  openCouponPopup(planId: string) {
    this.selectedPlanId = planId;
    this.showCouponPopup = true;
  }

  launchCoupon() {
    if (this.selectedPlanId) {
      console.log(this.selectedPlanId);
      this.loading = true;
      this.adminService.launchCuponCode(this.cuponCode,this.selectedPlanId).subscribe({
        next:(res) =>{
          console.log(res);
          this.closeCouponPopup()
          console.log(this.cuponCode);
          this.loading = false;
          this.showFullScreenMessage('success', `a new cupon code ${this.cuponCode.cuponCode} is created`)
        }, error: (error: HttpErrorResponse & { error: erroResponseModel }) =>{
          console.log(error);
          this.loading = false;
          this.showFullScreenMessage('error', error.error?.message || 'Failded to launch cupon code please try again later')
        }
      })
    }
  }

  // 2. delete popups
  closeDeletePopup() {
    this.showDeletePopup = false;
  }
  openDeletePopup(planId: string) {
    this.selectedPlanId = planId;
    this.showDeletePopup = true;
  }

  // 

  // navigation methods
  // 1. navigate to create plan page
  navigateToCreatePlan() {
    this.router.navigate(['createPlan'])
  }

  // 2. navigate to dashboard
  moveToDashboard() {
    this.router.navigate(['dashboard'])
  }
}

interface UiPlan extends plansResponseModel {
  editMode?: boolean; // local UI state only
}

interface planUserCount{
  planId : string;
  totalUsers : number;
}