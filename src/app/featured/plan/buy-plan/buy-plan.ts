import { Component } from '@angular/core';
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
import { CuponValidationResponse } from '../../../core/Models/cuponCodeModels';

@Component({
  selector: 'app-buy-plan',
  imports: [Navbar, Footer, FormsModule],
  templateUrl: './buy-plan.html',
  styleUrl: './buy-plan.css',
})
export class BuyPlan {
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
    private router: Router
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
      paymentDate: new Date().toISOString().slice(0, 19),
    };

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
      handler: (response: any) => this.handlePaymentSuccess(response),
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
    const confirmData = {
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      signature: response.razorpay_signature,
      userMail: this.userMail,
    };

    // Confirm the payment with backend
    this.planService.confirmPayment(confirmData).subscribe({
      next: () => {
        this.showPopup(
          'Payment Successful ✅',
          'Your payment was successful! Redirecting to home...'
        );
        setTimeout(() => this.router.navigate(['/home']), 2500);
      },
      error: () => {
        this.showPopup(
          'Payment Success ⚠️',
          'Payment succeeded, but receipt generation failed.'
        );
      },
    });
  }

  // ✅ Popup UI feedback helpers
  showPopup(title: string, message: string) {
    this.popupTitle = title;
    this.popupMessage = message;
  }

  closePopup() {
    this.popupMessage = '';
    this.popupTitle = '';
  }
}
