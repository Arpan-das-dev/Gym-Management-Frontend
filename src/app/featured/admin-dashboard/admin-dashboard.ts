import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin-service';
import { Authservice } from '../../core/services/authservice';
import { userDetailModel } from '../../core/Models/signupModel';
import { Navbar } from '../../shared/components/navbar/navbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faBoxesPacking,faCamera,faCheck,faCheckCircle,faChevronDown,faClipboardList,
        faDumbbell,faTimes,faTimesCircle,faTrash,faUser, faUserPlus, faUserShield,} from '@fortawesome/free-solid-svg-icons';
import { CommonModule, DatePipe, NgClass, NgStyle } from '@angular/common';
import { Footer } from '../../shared/components/footer/footer';
import { PlanService } from '../../core/services/plan-service';
import { genericResponseMessage } from '../../core/Models/genericResponseModels';
import { MonthlyRevenueResponseDto, TotalUserResponseDto } from '../../core/Models/planModel';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { AllMemberRequestDtoList, AllPendingRequestResponseWrapperDto, ApprovalRequestDto, ApprovalResponseDto, MemberRequestResponse, PendingRequestResponseDto, TrainerAssignmentResponseDto } from '../../core/Models/adminServiceModels';
import { FormsModule } from '@angular/forms';
import { ManagePlans } from "./manage-plans/manage-plans";
import { ManageProducts } from "./manage-products/manage-products";
import { Transactions } from "./transactions/transactions";
import { ManageCuponCode } from "./manage-cupon-code/manage-cupon-code";
import { ActiveCountService } from '../../core/services/active-count-service';
import { WebSocketService } from '../../core/services/web-socket-service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Navbar, FontAwesomeModule, NgStyle, Footer, NgClass, FormsModule, DatePipe, ManagePlans, ManageProducts, Transactions, ManageCuponCode],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit,OnDestroy {
  icons = {
    member: faUser,
    trainer: faDumbbell,
    admined: faUserShield,
    camera: faCamera,
    trash: faTrash,
    createMember: faUserPlus,
    plan: faClipboardList,
    product: faBoxesPacking,

    // icons for member's requests for trainer
    chevronDown: faChevronDown,
    check: faCheck,
    checkCircle: faCheckCircle,
    timesCircle: faTimesCircle,
    times: faTimes,
  };

  // Toasts
  toasts: { id: number; message: string; type: 'success' | 'error' }[] = [];

  constructor(
    private router: Router,
    private adminservice: AdminService,
    private authservice: Authservice,
    private planService: PlanService,
    private activeCountService: ActiveCountService,
    private webSocket: WebSocketService
  ) {}

  admin: userDetailModel = {
    id: '',
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    role: '', // You can make this more specific if RoleType enums/values are known
    joinDate: '', // LocalDate maps to string in ISO format (e.g. yyyy-MM-dd)
    emailVerified: false,
    phoneVerified: false,
    isApproved: false,
  };
  liveMemberCount = 0;
  liveTrainerCount = 0;
  liveAdminCount = 0;
  ngOnInit(): void {
    this.loadUserInfo();
    this.getTotalUsers();
    this.getRevenue();
    this.getSubScriptionsDetails();
    this.loadAllRequests();
    this.loadAllMemberRequests();
    this.loadAllUsersCount();
  }
  ngOnDestroy(): void {
      this.webSocket.disconnect()
  }
  loadUserInfo() {
    const identifer = localStorage.getItem('identifer');
    if (identifer !== null) {
      console.log('sending request');
      console.log(identifer);
      this.authservice.loadUserInfo(identifer).subscribe({
        next: (res) => {
          this.admin = res;
          console.log('Admin::=>', this.admin);
        },
      });
    }
    console.log('nothing found');
  }

  // total users section
  totalUsers = 0;
  userChange = 0;
  sign = ''
  getTotalUsers(): void {
    this.planService.getTotalUserForAllPlans().subscribe({
      next: (res:TotalUserResponseDto) => {
        console.log(res);
        this.totalUsers = res.totalActiveUsers;
        this.userChange = res.userChange;
        res.userChange>=0? this.sign = "+" : this.sign = "-"
      },
      error: (err) => {
        console.error('Failed to load total users:', err);
      },
    });
  }
  viewAllUsers() {
    this.router.navigate(['allMembers']); // navigate to view all users page
  }

  // total revenue section
  totalRevenue = 0;
  revenueGrowth = 0;
  viewRevenueDetails() {
    this.router.navigate(['']); // navigate to view all revenue details page
  }
  managePlans() {
    this.router.navigate(['managePlans']);
  }
  getRevenue() {
    this.planService.getMonthlyRevenue().subscribe({
      next: (res: MonthlyRevenueResponseDto) => {
        this.totalRevenue = res.currentMonthReview;
        this.revenueGrowth = res.changeInPercentage;
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
      },
    });
  }

  // subscription details card info
  activeSubscriptions = 0;
  subscriptionGrowth = 0;
  getSubScriptionsDetails() {
    this.planService.getTotalUserForAllPlans().subscribe({
      next: (res: TotalUserResponseDto) => {
        this.activeSubscriptions = res.totalActiveUsers;
        this.subscriptionGrowth = res.userChange;
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
      },
    });
  }

  // total orders for this cuurrent month sections and this will integrate later when we design for those page
  totalOrders = 234;
  orderGrowth = 2;
  viewOrders() {
    this.router.navigate(['']); // navigate to store orders page
  }

  // create sections which will lead to each create page
  createUser() {
    this.router.navigate(['/createUser']);
  }

  createPlan() {
    this.router.navigate(['createPlan']);
  }

  createProduct() {
    console.log('Navigating to create product page...');
  }

  // approve sections
  // 1. for user request to access to the platform

  pendingRequests: PendingRequestResponseDto[] = [];
  loadAllRequests() {
    this.adminservice.loadAllJoiningRequests().subscribe({
      next: (res: AllPendingRequestResponseWrapperDto) => {
        this.pendingRequests = res.responseDtoList;
        console.log(res);
        console.log(this.pendingRequests);
        
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
      },
    });
  }
  isActive(email: string) {
    return true;
  }
  getProfileImage(email: string) {
    return '';
  }

  approvedSuccessMessage: string = '';
  approvedErrorMessage: string = '';
  approveTrainer(
    email: string,
    name: string,
    joinDate: string,
    phone: string,
    role: string,
    index: number
  ) {
    console.log('Trainer approved:');
    const data: ApprovalRequestDto = {
      email: email,
      name: name,
      joinDate: joinDate,
      phone: phone,
      role: role,
    };
    this.adminservice.approveUserRequest(data).subscribe({
      next: (res: ApprovalResponseDto) => {
        console.log(res);
        this.approvedSuccessMessage = `request approved for the user ${name} mail sent to ${email}`;
        this.pendingRequests.splice(index, 1);
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
        this.approvedErrorMessage = err.message;
      },
    });
  }

  rejectUserSuccessMessage = '';
  rejectUserErrorMessage = '';
  rejectTrainer(
    email: string,
    name: string,
    joinDate: string,
    phone: string,
    role: string,
    index: number
  ) {
    const data: ApprovalRequestDto = {
      email: email,
      name: name,
      joinDate: joinDate,
      phone: phone,
      role: role,
    };
    this.adminservice.declienUserRequest(data).subscribe({
      next: (res: ApprovalResponseDto) => {
        console.log(res);
        this.rejectUserSuccessMessage = `request declined for the user ${name} mail sent to ${email}`;
        this.pendingRequests.splice(index, 1);
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
        this.approvedErrorMessage = err.message;
      },
    });
  }

  // 2. request section for member's to assign trainer

  memberRequest: MemberRequestResponse[] = [];
  expandedIndex: number | null = null;

  // Modal
  showApprovalModal = false;
  modalRequestId: string = '';
  eligibilityDate: string = '';
  modalError: string = '';
  modalLoading = false;

  loadAllMemberRequests() {
    this.adminservice.loadAllMemberRequestForTrainer().subscribe({
      next: (res: AllMemberRequestDtoList) => {
        this.memberRequest = res.requestDtoList;
      },
      error: (err: erroResponseModel) => {
        console.log(`error occured on ${err.timestamp.toString}`);
        console.log(`${err.status}:: error for path ${err.path}`);
        console.log(
          `error occured due to:: ${err.message} becuase--> ${err.error}`
        );
        this.approvedErrorMessage = err.message;
      },
    });
  }

  // drop down more details section

  toggleExpand(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  openApprovalModal(requestId: string) {
    this.modalRequestId = requestId;
    this.showApprovalModal = true;
    this.modalError = '';
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.modalError = '';
    this.eligibilityDate = '';
  }

  submitApproval() {
    if (!this.eligibilityDate) {
      this.modalError = 'Please select an eligibility date.';
      return;
    }

    this.modalLoading = true;

    // fake 1ms delay
    setTimeout(() => {
      this.adminservice
        .approveMemberRequest(this.modalRequestId, this.eligibilityDate)
        .subscribe({
          next: (res: TrainerAssignmentResponseDto) => {
            this.modalLoading = false;
            this.showApprovalModal = false;
            this.pushToast(
              `Trainer ${res.trainerName} assigned to member ${res.memberId}`,
              'success'
            );
          },
          error: () => {
            this.modalLoading = false;
            this.modalError = 'Failed to approve request. Try again.';
          },
        });
    }, 1);
  }

  rejectAssignment(requestId: string) {
    this.adminservice.declineMemberRequest(requestId).subscribe({
      next: () => {
        this.pushToast('Request declined successfully', 'success');
        this.memberRequest = this.memberRequest.filter(
          (r) => r.requestId !== requestId
        );
      },
      error: () => this.pushToast('Failed to decline request', 'error'),
    });
  }

  pushToast(message: string, type: 'success' | 'error') {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 5000);
  }

  loadAllUsersCount(){
      this.webSocket.connect("ws://localhost:8080/ws");

  this.webSocket.subscribe("/topic/activeMembers", count => {
    this.liveMemberCount = count;
  });

  // this.webSocket.subscribe("/topic/activeTrainers", count => {
  //   this.liveTrainerCount = count;
  // });

  // this.webSocket.subscribe("/topic/activeAdmins", count => {
  //   this.liveAdminCount = count;
  // });

  }
}
