import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faCheckCircle, faCode, faCogs, faExclamationCircle, faInfoCircle, faList, faLock, faPercent, faPlus, faRocket, faSearch, faSort, faTag, faTicket, faUser } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../../core/services/admin-service';
import { PlanService } from '../../../core/services/plan-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { plansResponseModel } from '../../../core/Models/planModel';
import { CommonModule } from '@angular/common';
import { CreateCuponCodeRequestDto, CuponCodeResponseDto, UpdateCuponRequestDto } from '../../../core/Models/cuponCodeModels';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { CuponUsersFilterPipePipe } from '../../../shared/pipes/cupon-users-filter-pipe-pipe';
import { CouponDateFilterPipePipe } from '../../../shared/pipes/coupon-date-filter-pipe-pipe';
import { CouponDiscountFilterPipePipe } from '../../../shared/pipes/coupon-discount-filter-pipe-pipe';
import { CuponsSortPipePipe } from '../../../shared/pipes/cupons-sort-pipe-pipe';
import { CuponSearhPipePipe } from '../../../shared/pipes/cupon-searh-pipe-pipe';
import { Navbar } from "../../../shared/components/navbar/navbar";
import { Footer } from "../../../shared/components/footer/footer";

@Component({
  selector: 'app-cupcode-management',
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule, FormsModule,
    CuponUsersFilterPipePipe, CouponDateFilterPipePipe, CouponDiscountFilterPipePipe, CuponsSortPipePipe, CuponSearhPipePipe, Navbar, Footer],
  templateUrl: './cupcode-management.html',
  styleUrl: './cupcode-management.css',

})
export class CupcodeManagement implements OnInit {
  icons = {
    lauch: faRocket,
    cupon: faTicket,
    plus: faPlus,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    cogs: faCogs,
    tag: faTag,
    lock: faLock,
    code: faCode,
    percent: faPercent,
    calendar: faCalendar,
    infoCircle: faInfoCircle,
    search: faSearch,
    sort: faSort,
    user: faUser,
    list:faList
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
  searchText: string = "";

  createCupon: FormGroup
  constructor(private router: Router,
    private adminService: AdminService,
    private planService: PlanService,
    private builder: FormBuilder) {
    this.createCupon = this.builder.group({
      planId: ['', [Validators.required, Validators.minLength(6)]],
      cuponCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('^[A-Z0-9_]+$')]],
      discount: [0.00, [Validators.required, Validators.min(0.1), Validators.max(100.00)]],
      validFrom: ['', [Validators.required]],
      validTill: ['', [Validators.required]],
      access: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]]
    })
  }

  // sorting and filtering

  sortField: string = '';
  filterUsers: number | null = null;
  filterDate: string | null = null;
  filterDiscount: number | null = null;


  ngOnInit(): void {
    this.loadAllPLans()
    this.loadAllCupons()
  }


  plans: plansResponseModel[] = [];

  loadAllPLans() {
    this.planService.getAllPlans().subscribe({
      next: (res) => {
        console.log(res.responseDtoList);
        this.plans = res.responseDtoList;
      }
    })
  }

  cuponCodes: CuponCodeResponseDto[] = []
  loadAllCupons() {
    this.adminService.getAllCuponCodes().subscribe({
      next: (res: { responseDtoList: CuponCodeResponseDto[] }) => {
        this.cuponCodes = res.responseDtoList || [];
        console.log("cupon list:", this.cuponCodes);
        console.log("cupon codes fetched from backend of size " + this.cuponCodes.length);
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const message = error.error?.message || 'Failed to load cupon codes';
        this.showFullScreenMessage('error', message);
      }
    });
  }
onSubmit() {

  // 🛑 Stop immediately if form is invalid
  if (this.createCupon.invalid) {
    this.showFullScreenMessage('error', "Please fill the form properly");
    return; // <-- IMPORTANT
  }

  this.loading = true;

  // ===========================
  //     UPDATE MODE
  // ===========================
  if (this.isEditMode) {

    if (!this.editingCouponId) {
      this.loading = false;
      this.showFullScreenMessage('error', "No coupon selected to update");
      return;
    }

    const data: UpdateCuponRequestDto = {
      planId: String(this.createCupon.get('planId')?.value || ''),
      validFrom: String(this.createCupon.get('validFrom')?.value || ''),
      validity: String(this.createCupon.get('validTill')?.value || ''),
      offPercentage: Number(this.createCupon.get('discount')?.value || 0),
      access: String(this.createCupon.get('access')?.value || ''),
      description: String(this.createCupon.get('description')?.value || ''),
    };

    this.adminService.editCuponCode(data, this.editingCouponId).subscribe({
      next: (res: genericResponseMessage) => {
        this.loading = false;
        this.loadAllCupons();
        this.createCupon.reset();
        const success = res.message || "Coupon updated successfully";
        this.showFullScreenMessage('success', success);
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to update coupon';
        this.showFullScreenMessage('error', message);
      }
    });

    return; // END UPDATE MODE
  }


  // ===========================
  //     CREATE MODE
  // ===========================

  const data: CreateCuponCodeRequestDto = {
    cuponCode: String(this.createCupon.get('cuponCode')?.value || ''),
    validFrom: String(this.createCupon.get('validFrom')?.value || ''),
    validity: String(this.createCupon.get('validTill')?.value || ''),
    offPercentage: Number(this.createCupon.get('discount')?.value || 0),
    access: String(this.createCupon.get('access')?.value || ''),
    description: String(this.createCupon.get('description')?.value || ''),
  };

  const planId = this.createCupon.get('planId')?.value || '';

  this.adminService.launchCuponCode(data, planId).subscribe({
    next: (res: genericResponseMessage) => {
      this.loading = false;
      this.loadAllCupons();
      const success = res.message || "Coupon created successfully";
      this.showFullScreenMessage('success', success);
      this.createCupon.reset();
      this.showCouponPopup = false;
    },
    error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
      this.loading = false;
      const message = error.error?.message || 'Failed to create coupon';
      this.showFullScreenMessage('error', message);
    }
  });
}


  // update cupon code

  isEditMode = false;
  editingCouponId: string | null = null;
  editCoupon(coupon: CuponCodeResponseDto) {
    this.isEditMode = true;
    this.editingCouponId = coupon.cuponCode;


    this.createCupon.patchValue({
      planId: coupon.planId,
      cuponCode: coupon.cuponCode,
      discount: coupon.offPercentage,
      validFrom: coupon.validFrom,
      validTill: coupon.validityDate,
      access: coupon.access,
      description: coupon.description,
    });
  }

  // delete cupon code

  pendingDeleteId: string = "";
  pendingDeletedPlanId: string = ""
  confirmDelete(coupon: CuponCodeResponseDto) {
    this.pendingDeleteId = coupon.cuponCode;
    this.pendingDeletedPlanId = coupon.planId;
    this.showDeletePopup = true;
  }

  deleteConfirmed() {
    if (!this.pendingDeleteId || !this.pendingDeletedPlanId) {
      console.error("Delete IDs missing!");
      console.log(this.pendingDeleteId);
      console.log("++++++++++++++++++");

      console.log(this.pendingDeletedPlanId);

      return;
    }

    this.loading = true;
    this.adminService.deleteCuponCode(this.pendingDeletedPlanId, this.pendingDeleteId).subscribe({
      next: (res: genericResponseMessage) => {
        this.loadAllCupons()
        this.pendingDeleteId = '';
        this.pendingDeletedPlanId = '';
        this.showDeletePopup = false;
        this.loading = false;
        console.log(res);
        const message = res.message || "Successfully deleted cupon code"
        this.showFullScreenMessage('success', message)
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        this.loading = false
        console.log(error);
        const message = error.error?.message || 'Failed to delete plan';
        this.showFullScreenMessage('error', message);
      }
    })
  }
}

