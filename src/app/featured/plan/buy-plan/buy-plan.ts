import { Component } from '@angular/core';
import { Navbar } from "../../../shared/components/navbar/navbar";
import { Footer } from "../../../shared/components/footer/footer";
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../core/services/plan-service';
import { Authservice } from '../../../core/services/authservice';
import { Router } from '@angular/router';
import { PlanPaymentRequestDto, plansResponseModel } from '../../../core/Models/planModel';

@Component({
  selector: 'app-buy-plan',
  imports: [Navbar, Footer,FormsModule],
  templateUrl: './buy-plan.html',
  styleUrl: './buy-plan.css',
})
export class BuyPlan {
  plan!: plansResponseModel | null;

  constructor(private planService : PlanService, private authService: Authservice, private router: Router){
    this.userId = this.authService.getUserId();
    this.userName = this.authService.getUserName();
    this.userMail = this.authService.getUserMail();
    const nav = this.router.currentNavigation();
    this.plan = nav?.extras?.state?.['plan'] ?? null;

    if (!this.plan) {
      console.warn('No plan data found, redirecting to plans page...');
      this.router.navigate(['/plans']);
    }

  }
  cuponCode:string = '';
  offerDiscount: number = 0
  finalPrice = 0
  cuponCodeCheck() {
   this.planService.getDiscount(this.cuponCode)
  }

  userId = '';
  userName = '';
  userMail ='';

  buy(){
   if(this.plan){
     const data: PlanPaymentRequestDto = {
      userId : this.userId,
      userName : this.userName,
      userMail : this.userMail,
      planId: this.plan?.planId,
      currency:"INR",
      amount: this.plan.price - this.offerDiscount,
      cuponCode: this.cuponCode,
      paymentDate: new Date().toISOString().slice(0,19)
    }
    this.planService.buyPlan(data).subscribe({
      next: (orderResponse) => {
        console.log('Order created:', orderResponse);
       
        this.openRazorpay(orderResponse, data.amount);
      },
      error: (err) => {
        console.error('Order creation failed', err);
        alert('Something went wrong. Please try again.');
      }
    });
   }
  }

    openRazorpay(orderResponse: any, amount: number) {
    const options: any = {
      key: 'rzp_test_RVFTNhMjk9323S', // 🔑 Replace with your Razorpay test key
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'FitStudio Gym',
      description: this.plan?.planName,
      image: 'assets/logo.png',
      order_id: orderResponse, // backend returns Razorpay order id
      handler: (response: any) => {
        console.log('Payment success:', response);
        this.router.navigate(['/payment-success'], {
          state: { payment: response, plan: this.plan },
        });
      },
      prefill: {
        name: this.userName,
        email: this.userMail,
      },
      theme: {
        color: '#F97316',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

}
