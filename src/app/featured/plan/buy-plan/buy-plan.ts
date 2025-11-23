import { Component, NgZone, OnInit } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../core/services/plan-service';
import { Authservice } from '../../../core/services/authservice';
import { Router } from '@angular/router';
import {
  PlanPaymentRequestDto,
  plansResponseModel,
} from '../../../core/Models/planModel';
import { CuponCodeResponseDto, CuponValidationResponse } from '../../../core/Models/cuponCodeModels';
import { CommonModule, DatePipe } from '@angular/common';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';

@Component({
  selector: 'app-buy-plan',
  imports: [Navbar, Footer, FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './buy-plan.html',
  styleUrl: './buy-plan.css',
  providers: [DatePipe]
})
export class BuyPlan implements OnInit {
  // global ui state
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  // gloabal method to show full screen message with loading screen
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  icons = {
    cogs: faCircle,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
  }
  plan!: plansResponseModel | null;
  cuponCode: string = '';
  offerDiscount: number = 0;
  offPercentage: number = 0;
  userId = '';
  userName = '';
  userMail = '';

  successMessage = '';
  errorMessage = '';
  popupMessage = '';
  popupTitle = '';

  constructor(
    private planService: PlanService,
    private authService: Authservice,
    private router: Router,
    private ngZone: NgZone
  ) {
    // ✅ Load user details from auth service
    this.userId = this.authService.getUserId();
    this.userName = this.authService.getUserName();
    this.userMail = this.authService.getUserMail();

    // ✅ Load selected plan from navigation state
    const nav = this.router.currentNavigation();
    this.plan = nav?.extras?.state?.['plan'] ?? null;

    if (!this.plan) {
      this.router.navigate(['/plans']);
    }
  }

  ngOnInit(): void {
    this.loadAllCupons()
  }
  // load all cupons for validation
  cuponList: CuponCodeResponseDto[] = [];
  loadAllCupons() {
    // This method would ideally call a service to fetch all coupons
    this.loading = true;
    this.planService.getAllPublicCupons().subscribe({
      next: (res: {responseDtoList: CuponCodeResponseDto[]}) => {
        // console.log("here goes the cupon codes ");
        // console.log(res.responseDtoList);
        this.cuponList = res.responseDtoList;
        // console.log(this.cuponList);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    })
  }

  // ✅ Validate coupon code and calculate discount
  cuponCodeCheck() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.cuponCode.trim()) {
      this.errorMessage = 'Please enter a coupon code.';
      return;
    }
    

    this.planService.getDiscount(this.cuponCode).subscribe({
      next: (res: CuponValidationResponse) => {
        if (res.valid) {
          this.offPercentage = res.offPercentage;
          this.offerDiscount = (this.plan!.price * res.offPercentage) / 100;
          this.successMessage = `Coupon applied! ${res.offPercentage}% off 🎉`;
        } else {
          this.offerDiscount = 0;
          this.offPercentage = 0;
          this.errorMessage = 'Invalid coupon code ❌';
        }
      },
      error: () => {
        this.offerDiscount = 0;
        this.offPercentage = 0;
        this.errorMessage =
          'Server error while validating coupon. Try again later.';
      },
    });
  }

  applyCoupon(code: string) {
  this.cuponCode = code;
  this.cuponCodeCheck();
}


  // ✅ Initiate plan purchase (create Razorpay order)
  buy() {
    if (!this.plan) return;

    const data: PlanPaymentRequestDto = {
      userId: this.userId,
      userName: this.userName,
      userMail: this.userMail,
      planId: this.plan.planId,
      currency: 'INR',
      amount: this.plan.price - this.offerDiscount,
      cuponCode: this.cuponCode.trim(),
      paymentDate: this.getLocalHighPrecisionTimestamp(),
    };
    console.log(data.paymentDate);
    // Call backend to create Razorpay order
    this.planService.buyPlan(data).subscribe({
      next: (res) => {
        // ✅ Extract orderId from backend response (GenericResponse)
        const orderId =
          res?.data || res?.message || res?.response || res?.orderId || null;

        if (!orderId) {
          this.showPopup(
            'Error ❌',
            'Unable to create payment order. Please try again.'
          );
          return;
        }

        // ✅ Proceed to Razorpay checkout
        this.openRazorpay(orderId, data.amount);
      },
      error: () => {
        this.showPopup(
          'Error ❌',
          'Something went wrong while creating the payment order.'
        );
      },
    });
  }

  // ✅ Razorpay payment window handler
  openRazorpay(orderId: string, amount: number) {
    const options: any = {
      key: 'rzp_test_RVFTNhMjk9323S', // ⚠️ Replace with live key in production
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      name: 'FitStudio Gym',
      description: this.plan?.planName,
      image: 'assets/logo.png',
      order_id: orderId,
      handler: (response: any) => {
        this.ngZone.run(() =>{
          this.handlePaymentSuccess(response)
        })
        
      } ,
      prefill: {
        name: this.userName,
        email: this.userMail,
      },
      theme: {
        color: '#F97316',
      },
      modal: {
        ondismiss: () => {
          this.showPopup(
            'Payment Cancelled ⚠️',
            'You cancelled the payment process.'
          );
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);

    // ✅ Handle payment failure explicitly
    razorpay.on('payment.failed', (response: any) => {
      console.error('Payment Failed:', response.error);
      this.showPopup(
        'Payment Failed ❌',
        'Payment could not be completed. Please try again.'
      );
    });

    razorpay.open();
  }

  // ✅ Called when Razorpay returns successful payment response
  private handlePaymentSuccess(response: any) {
    this.loading = true;
    const confirmData = {
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      signature: response.razorpay_signature,
      userMail: this.userMail,
    };


    // Confirm the payment with backend
    this.ngZone.run(()=> {
      this.planService.confirmPayment(confirmData).subscribe({
        next: (res: genericResponseMessage) => {
          console.log(res.message);
          this.showPopup("success", res.message || 'Payment Successful ✅ Your plan has been activated.');
          setTimeout(()=>{
            this.showFullScreenMessage("success",res.message ||'Payment Successful ✅ Your plan has been activated.')
          },3000)
          this.router.navigate(['/plans']);
        },
        error: (err: erroResponseModel) => {
          this.showPopup('error', err.message || 'Payment confirmation failed. Please contact support.');
        },
      });
    })
    
  }

  // ✅ Popup UI feedback helpers
  showPopup(title: string, message: string) {
  this.ngZone.run(() => {
    this.popupTitle = title;
    this.popupMessage = message;
    this.loading = false; // stop loader
  });
}

  closePopup() {
    this.popupMessage = '';
    this.popupTitle = '';
  }

  getLocalHighPrecisionTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const millis = String(now.getMilliseconds()).padStart(3, '0');

    // Example: "2025-11-22T03:04:15.567"
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}`;
  }
}
