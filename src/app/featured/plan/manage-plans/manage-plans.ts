import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../../core/services/plan-service';
import { plansResponseModel, PlanUpdateRequestDto } from '../../../core/Models/planModel';
import { AdminService } from '../../../core/services/admin-service';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCheckCircle, faCogs, faEdit, faExclamationCircle, faPlus, faPlusCircle, faTicket, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CreateCuponCodeRequestDto } from '../../../core/Models/cuponCodeModels';
import { NgClass } from '@angular/common';

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
    exclamationCircle: faExclamationCircle
  }

  // global fake loading ts 
  showFakeLoading(callback: () => void) {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      callback();
    }, 1200);
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
    validity: ''
  }


  // below methods are used for mangement for plans by admin all method's internal 
  // methods are defined in admin service's plan managment section

  plans: UiPlan[] = []

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


  // 2. update plans as per requirements
  request: PlanUpdateRequestDto = {
    id: '',
    planName: '',
    duration: 0,
    features: [],
    price: 0.00
  }

  // ** remove feature during plan editon
  removeFeature(planId: string, index: number) {
    const plan = this.plans.find((p) => p.planId === planId);
    if (plan) plan.planFeatures.splice(index, 1);
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
  const dto: PlanUpdateRequestDto = {
    id: plan.planId,
    planName: plan.planName,
    price: plan.price,
    duration: plan.duration,
    features: plan.planFeatures,
  };
  this.showFakeLoading(() => {
    this.adminService.updatePlan(plan.planId, dto).subscribe({
      next: () => {
        this.showFullScreenMessage('success', 'Plan updated successfully!');
        this.loadAllPlans();
      },
      error: () => this.showFullScreenMessage('error', 'Failed to update plan.'),
    });
  });
}
  // delete plan
  confirmDelete() {
    if (this.selectedPlanId) {
      this.showFakeLoading(() => {
        this.adminService.deletePlan(this.selectedPlanId!).subscribe(() => this.loadAllPlans());
        this.closeDeletePopup();
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
    // if (this.selectedPlanId) {
    //   this.showFakeLoading(() => {
    //     console.log('Launching coupon', this.coupon);
    //     this.adminService.launchCoupon(this.selectedPlanId!, this.coupon).subscribe();
    //     this.closeCouponPopup();
    //   });
    // }
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