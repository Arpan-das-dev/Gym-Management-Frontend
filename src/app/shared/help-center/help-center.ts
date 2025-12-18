import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../core/services/authservice';
import { ReportAndMessageService } from '../../core/services/report-and-message-service';
import { AllMessageWrapperResponseDto, AllReportsList, ReportOrMessageCreationRequestDto } from '../../core/Models/reportServiceModels';
import { faArrowLeft, faArrowRight, faCheckCircle, faClock, faCogs, faD, faEnvelope, faExclamationCircle, faFileLines, faLock, faPaperPlane, faPhone, faTrash, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { GenericResponse } from '../../core/Models/genericResponseModels';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-center',
  imports: [FontAwesomeModule,FormsModule,DatePipe,NgClass,RouterLink],
  templateUrl: './help-center.html',
  styleUrl: './help-center.css',
})
export class HelpCenter implements OnInit {
    /**
     * global variables which depends on authservice/ if not logged in or not logged in it
     * reacts like that
     */
    isLoggedIn: boolean = false;
    // global ui state
    loading = false;
    showMessage = false;
    messageText = '';
    messageType: 'success' | 'error' = 'success';
    globalLoadinText: string = 'loading';
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
      cogs: faCogs,
      checkCircle: faCheckCircle,
      exclamationCircle: faExclamationCircle,
      envelope : faEnvelope,
      phone : faPhone,
      clock : faClock,
      fileLines : faFileLines,
      arrowLeft : faArrowLeft,
      arrowRight : faArrowRight,
      lock : faLock,
      paperPlane : faPaperPlane,
      userLock : faUserLock,
      trash : faTrash
    }
  constructor(
    private auth: Authservice,
    private report: ReportAndMessageService
  ) {
    
  }
  ngOnInit(): void {
    this.userMail = this.auth.getUserMail();
    this.userRole = this.auth.getUserRole() || this.auth.getRole();
    this.userName = this.auth.getUserName();
    this.isLoggedIn = this.auth.isLoggedIn()
    this.loadAllReportsByUserId()
  }
  userName: string = '';
  
  userMail: string = '';
  userRole: string = '';
  subject: string = '';
  message: string = '';

  submitReport() {
    if(this.isLoggedIn){
      this.loading = true;
      this.globalLoadinText = "Creating New Request to Admin"
      const data: ReportOrMessageCreationRequestDto = {
      userId:  this.auth.getUserId(),
      userRole: this.userRole,
      emailId: this.userMail,
      message: this.message,
      subject: this.subject,
      messageTime: new Date().toISOString(),
      userName: this.userName,
    };
    this.report.createRequest(data).subscribe({
      next:(res:GenericResponse) => {
        this.loading = false;
        this.showFullScreenMessage('success',res.message)
        setTimeout(()=> this.loadAllReportsByUserId(),3000)
        this.message = ""
        this.subject = ""
      },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          console.log('Error Occured ::=>');
          console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load All Reports Due to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
    })
    }
  }

  userReports : AllReportsList[] = []
  loadAllReportsByUserId(){
    if(this.auth.isLoggedIn()){
      this.loading = true;
      this.globalLoadinText = "Loading Your Requests"
      this.report.fetchReportsOrMessageByUserId(this.auth.getUserId()).subscribe({
        next:(res:AllMessageWrapperResponseDto) => {
          this.userReports = res.reportsLists;
          console.log(res);
          this.loading = false;
          this.showFullScreenMessage('success',"Loaded All Reports For You")
        },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          console.log('Error Occured ::=>');
          console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load All Reports Due to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
      })
    }
  }

  deletableRequestId : string =  ""
  openPopup : boolean = false
  openDeletePopup(id : string){
    this.deletableRequestId = id;
    this.openPopup = true;
  }
  closeDeletePopup(){
    this.deletableRequestId = ""
    this.openPopup = false;
  }
  deleteReportByUser(){
    this.loading = true;
      this.globalLoadinText = "Deleteing Your Request"
    this.report.deleteReportByUser(this.auth.getUserId(), this.deletableRequestId).subscribe({
       next:(res:GenericResponse) => {
        this.loading = false;
        this.showFullScreenMessage('success',res.message)
        setTimeout(()=> this.loadAllReportsByUserId(),3000)
       },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          console.log('Error Occured ::=>');
          console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Delete Report Due to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
    })
  }
  faqs: faqs[] = [
  {
    question: 'How do I sign up for a membership?',
    answer:
      "You can sign up for a membership by clicking the 'Sign Up' button on our homepage. Choose your preferred plan, fill in your details, and complete the payment process. You'll receive a confirmation email once your membership is activated."
  },
  {
    question: 'Can I change my membership plan?',
    answer:
      "Yes, you can upgrade or downgrade your membership plan at any time. Go to your Member Dashboard, navigate to the 'My Plan' section, and select 'Change Plan'. The price difference will be prorated based on your remaining subscription period."
  },
  {
    question: 'How do I book a session with a trainer?',
    answer:
      "To book a trainer session, go to the Trainers page, browse through our certified trainers, and click 'Request Trainer' on your preferred trainer's profile. Once approved, you can schedule sessions through your Member Dashboard."
  },
  {
    question: 'What is the cancellation policy?',
    answer:
      "You can cancel your membership anytime. If you cancel before your billing cycle ends, you'll continue to have access until the end of that period. Refunds are processed within 5–7 business days for eligible cancellations made within 14 days of purchase."
  },
  {
    question: 'How do I reset my password?',
    answer:
      "Click 'Forgot Password' on the login page, enter your registered email address, and we'll send you a password reset link. The link expires in 24 hours for security purposes."
  },
  {
    question: 'Can I freeze my membership temporarily?',
    answer:
      "Yes, you can freeze your membership for up to 30 days per year. Contact our admin team through this Help Center or visit your Member Dashboard to request a freeze. Your billing will pause during the frozen period."
  },
  {
    question: 'How do I track my fitness progress?',
    answer:
      'Your Member Dashboard includes comprehensive tracking tools for BMI, personal records (PRs), workout sessions, and login streaks. All your data is automatically synced and displayed in easy-to-read charts and graphs.'
  },
  {
    question: 'Are there any discounts available?',
    answer:
      'Yes! We offer various promotional discounts throughout the year. Check our Plans page for current offers, or subscribe to our newsletter to receive exclusive discount codes. We also offer student and corporate discounts.'
  },
  {
    question: 'How do I leave a review for my trainer?',
    answer:
      "After completing sessions with a trainer, go to the Trainers page, find your trainer's profile, and click 'View Reviews'. You can submit your rating and written review there. Your feedback helps other members choose the right trainer."
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI payments, net banking, and popular digital wallets. All transactions are secured with industry-standard encryption.'
  }
];

}
export interface faqs  {
  question : string,
  answer : string
}
