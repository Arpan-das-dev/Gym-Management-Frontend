import { Component, OnDestroy, OnInit } from '@angular/core';
import { TrainerService } from '../../core/services/trainer-service';
import { DataTransferService } from '../../core/services/data-transfer-service';
import { filter, take } from 'rxjs';
import {
  AllPublicTrainerInfoResponseWrapperDto,
  AllReviewResponseWrapperDto,
  publicTrainerInfoResponseDtoList,
  ReviewAddRequestDto,
  ReviewResponseDto,
  ReviewUpdateRequestDto,
} from '../../core/Models/TrainerServiceModels';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  faArrowLeft,
  faCheckCircle,
  faExclamationCircle,
  faStar,
  faEdit,
  faTrash,
  faFlag,
  faArrowUp,
  faArrowDown,
  faExclamationTriangle,
  faCogs,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { Authservice } from '../../core/services/authservice';
import { GenericResponse } from '../../core/Models/genericResponseModels';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { CookieService } from 'ngx-cookie-service';
import { ReportOrMessageCreationRequestDto } from '../../core/Models/reportServiceModels';
import { ReportAndMessageService } from '../../core/services/report-and-message-service';

@Component({
  selector: 'app-view-reviews',
  standalone: true,
  imports: [
    FontAwesomeModule,
    NgClass,
    RouterLink,
    FormsModule,
    DatePipe,
    Navbar,
    Footer,
    DecimalPipe,
  ],
  templateUrl: './view-reviews.html',
  styleUrl: './view-reviews.css',
})
export class ViewReviews implements OnInit , OnDestroy{
  /** ───────────────────────────────────────────────
   *  🟠 GLOBAL UI STATE
   *────────────────────────────────────────────────*/
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  globalLoadinText = 'loading';
  isLoggedIn = false;

  /** Icons */
  icons = {
    cogs: faCogs,
    checkCircle: faCheckCircle,
    warning : faExclamationTriangle,
    exclamationCircle: faExclamationCircle,
    leftArrow: faArrowLeft,
    star: faStar,
    edit: faEdit,
    trash: faTrash,
    flag: faFlag,
    arrowUp: faArrowUp,
    arrowDown: faArrowDown,
    close : faClose
  };

  /** Trainer model for header section */
  trainerModel: trainerModel = {
    name: '',
    trainerId: '',
    rating: 0.0,
    specialities: [],
  };

  /** User identity */
  userId = '';
  userRole = '';
  userName = '';

  constructor(
    private trainer: TrainerService, 
    private auth: Authservice,
    private cookie: CookieService,
    private router: Router,
    private report : ReportAndMessageService
  ) {
    this.userId = this.auth.getUserId();
    this.userRole = this.auth.getRole() || this.auth.getUserRole() || 'USER';
    this.userName = this.auth.getUserName();
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  /** ───────────────────────────────────────────────
   *  🟦 INITIALIZATION
   *────────────────────────────────────────────────*/
  ngOnInit() {
    const id = this.cookie.get('reviewTrainerId');
    if (!id) {
      this.showError('Unable to Find Trainer Redirecting to Trainers page');
      setTimeout(() => this.router.navigate(['ourTrainers']), 2000);
    }
    this.fillTrainerModel(id).then(() => {
      this.loadReviewsByUserId();
      this.loadAllReviews();
    });
  }

  fillTrainerModel(id: string): Promise<void> {
    return new Promise((resolve) => {
      this.trainer.getAllBasicInfo().subscribe({
        next: (res: AllPublicTrainerInfoResponseWrapperDto) => {
          const data = res.publicTrainerInfoResponseDtoList.find(
            (t) => t.id === id
          );
          if (data) {
            this.trainerModel = {
              name: data.firstName + ' ' + data.lastName,
              trainerId: data.id,
              rating: data.averageRating,
              specialities: data.specialities,
            };
          } else {
            this.showError(
              'Unable to Find Trainer Redirecting to Trainers page'
            );
            setTimeout(() => this.router.navigate(['ourTrainers']), 2000);
          }
          resolve();
        },
      });
    });
  }

  /** ───────────────────────────────────────────────
   *  ⭐ ADD REVIEW
   *────────────────────────────────────────────────*/
  review = 0;
  comment = '';

  addreview() {
    if (!this.userRole) return;

    this.loading = true;

    const data: ReviewAddRequestDto = {
      userId: this.userId,
      userRole: this.userRole,
      review: this.review,
      comment: this.comment,
      reviewDate: new Date().toISOString(),
      userName: this.userName,
    };

    this.trainer
      .addReviewForTrainer(this.trainerModel.trainerId, data)
      .subscribe({
        next: (res: GenericResponse) => {
          console.log(res);
          console.log(`fetched response from backend is ${res.message}`);
          this.loading = false;
          this.showSuccess(res.message);
          this.pageNo = 0;
          this.comment = '';
          this.review = 0.0;
          setTimeout(() => {
            this.loadReviewsByUserId();
            this.loadAllReviews();
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.catchError(
            err,
            'Failed to Add review for ' + this.trainerModel.name
          );
        },
      });
  }

  /** ───────────────────────────────────────────────
   *  📘 PAGINATION + SORTING
   *────────────────────────────────────────────────*/
  pageNo = 0;
  pageSize = 30;
  totalElements = 0;
  lastPage = false;
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  toggleSort() {
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.loadReviewsByUserId();
    this.loadAllReviews();
  }

  goNext() {
    if (this.lastPage) return this.showError('Last page reached');
    this.pageNo++;
    this.loadAllReviews();
  }

  goPrevious() {
    if (this.pageNo === 0) return this.showError('Already on the first page');
    this.pageNo--;
    this.loadAllReviews();
  }

  /** ───────────────────────────────────────────────
   *  📙 LOAD ALL REVIEWS EXCEPT USER'S
   *────────────────────────────────────────────────*/
  reviews: ReviewResponseDto[] = [];

  loadAllReviews() {
    console.log('load ALl reviews triggered');
    this.loading = true;
    this.globalLoadinText = 'Loading Reviews for ' + this.trainerModel.name;
    this.trainer
      .getAllReviews(
        this.trainerModel.trainerId,
        this.pageNo,
        this.pageSize,
        this.sortDirection
      )
      .subscribe({
        next: (res: AllReviewResponseWrapperDto) => {
          console.log(res);
          this.reviews = [
            ...res.reviewResponseDtoList.filter(
              (r) => r.userId !== this.userId
            ),
          ];
          this.pageNo = res.pageNo;
          this.pageSize = res.pageSize;
          this.totalElements = res.totalElements;
          this.lastPage = res.lastPage;
          this.loading = false;
          this.showSuccess(
            ` Successfully Loaded Reviews for ${this.trainerModel.name}`
          );
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.loading = false;
          this.catchError(
            err,
            `Failed to load reviews for ${this.trainerModel.name}`
          );
        },
      });
  }
  /** ───────────────────────────────────────────────
   *  📗 LOAD USER'S OWN REVIEW
   *────────────────────────────────────────────────*/
  UserpageNo = 0;
  UserpageSize = 30;
  UsertotalElements = 0;
  UsertotalPages = 0;
  UserlastPage = false;
  UsersortDirection: 'ASC' | 'DESC' = 'DESC';
    goNextUserReview() {
    if (this.UserlastPage) return this.showError('Last page reached');
    this.UserpageNo++;
    this.loadAllReviews();
  }

  goPreviousUserReview() {
    if (this.UserpageNo === 0) return this.showError('Already on the first page');
    this.UserpageNo--;
    this.loadAllReviews();
  }
  Userreviews: ReviewResponseDto[] = [];
  loadReviewsByUserId() {
    this.trainer
      .getReviewByUserId(
        this.userId,
        this.UserpageNo,
        this.UserpageSize,
        this.UsersortDirection
      )
      .subscribe({
        next: (res: AllReviewResponseWrapperDto) => {
          console.log(res);
          this.Userreviews = res.reviewResponseDtoList;
          this.UserpageNo = res.pageNo;
          this.UserpageSize = res.pageSize;
          this.UsertotalElements = res.totalElements;
          this.UserlastPage = res.lastPage;
          this.loading = false;
          this.showSuccess(
            ` Successfully Loaded Reviews for ${this.trainerModel.name}`
          );
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.loading = false;
          this.catchError(
            err,
            `Failed to load reviews for ${this.trainerModel.name} `
          );
        },
      });
  }

  /** ───────────────────────────────────────────────
   *  ✏️ UPDATE REVIEW
   *────────────────────────────────────────────────*/
  updateItem = '';
  updateComment = ''
  updateReviewStar:number = 0.00
  update(review: ReviewResponseDto) {
    if (review.userId !== this.userId)
      return this.showError('You can only update your review');

    this.updateComment = review.comment;
    this.updateReviewStar = review.review;
    this.updateItem = review.reviewId;
  }

  cancelUpdate() {
    this.updateItem = '';
    this.updateComment = '';
    this.updateReviewStar = 0;
  }

  confirmUpdate() {
    const data: ReviewUpdateRequestDto = {
    userId: this.userId,
    comment: this.updateComment,
    review: this.updateReviewStar,
    trainerId: this.trainerModel.trainerId,
    reviewDate: new Date().toISOString(),
    userName: this.userName,
    userRole: this.userRole,
  };

    this.loading = true;

    this.trainer.updateReviewByUser(this.updateItem, data).subscribe({
      next: (res:GenericResponse) => {
        this.cancelUpdate();
        this.loading = false;
        this.showSuccess(res.message);
        setTimeout(()=>{
           this.loadReviewsByUserId();
        this.loadAllReviews();
        },2000)
      },
      error: (err: HttpErrorResponse) =>
        this.catchError(err, 'Failed to update review'),
    });
  }

  /** ───────────────────────────────────────────────
   *  🗑 DELETE REVIEW
   *────────────────────────────────────────────────*/
  showDeletePopUp = false;
  deleteItem: ReviewResponseDto | null = null;

  showDeletePopup(r: ReviewResponseDto) {
    this.deleteItem = r;
    this.showDeletePopUp = true;
  }

  closeDeletePopup() {
    this.showDeletePopUp = false;
    this.deleteItem = null;
  }
  getStars(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}
  confirmDelete() {
    if (!this.deleteItem) return this.showError('No review selected');
    if (this.deleteItem.userId !== this.userId)
      return this.showError('Cannot delete another user’s review');

    this.loading = true;

    this.trainer
      .deleteReviewByUser(
        this.userId,
        this.deleteItem.reviewId,
        this.trainerModel.trainerId
      )
      .subscribe({
        next: (res:GenericResponse) => {
          this.closeDeletePopup();
          this.loading = false;
          this.showSuccess(res.message);

          this.loadReviewsByUserId();
          this.loadAllReviews();
        },
        error: (err:HttpErrorResponse) => this.catchError(err, 'Failed to delete review'),
      });
  }

  /** ───────────────────────────────────────────────
   *  🚨 REPORT REVIEW — untouched as requested
   *────────────────────────────────────────────────*/
  showReportPopup = false;
  reportSubject = '';
  reportMessage = '';
  reportReviewId = '';

  openReportPopup(id: string) {
    this.reportReviewId = id;
    this.showReportPopup = true;
    this.reportSubject = '';
    this.reportMessage = '';
  }

  closeReportPopup() {
    this.showReportPopup = false;
    this.reportReviewId = ''
    this.reportSubject = '';
    this.reportMessage = '';
  }

  submitReport() {
    this.loading = true;
    this.globalLoadinText = "Submitting Report"
    const data: ReportOrMessageCreationRequestDto = {
      userId : this.userId,
      userRole : this.userRole,
      userName : this.userName,
      emailId : this.auth.getUserMail(),
      message : this.reportMessage,
      subject : this.reportSubject,
      messageTime : new Date().toISOString()
    }
    console.log(`sending request dto as ${data}`);
    this.report.createRequest(data).subscribe({
      next:(res:GenericResponse) => {
        console.log(`fetched repose from backend as ${res.message}`);
        this.closeReportPopup()
        this.loading = false;
        this.showSuccess(res.message)
      }, error :(err: HttpErrorResponse) => {
        console.log(err);
        this.catchError(err,"Falied To create Request Due to Internal Error")
      }
    })
  }
  /** ───────────────────────────────────────────────
   *  🔥 GLOBAL ERROR HANDLING
   *────────────────────────────────────────────────*/
  catchError(err: HttpErrorResponse, defaultMsg: string) {
    this.loading = false;
    const errorBody: erroResponseModel | undefined = err.error;
    let messageToShow = defaultMsg;
    if (errorBody && errorBody.message) {
      messageToShow = errorBody.message;
      console.log('Backend Error Message:', messageToShow);
    } else {
      messageToShow = err.message || messageToShow;
      console.error('Unknown error structure:', err);
    }
    this.showError(messageToShow);
  }

  showSuccess(msg: string) {
    this.messageType = 'success';
    this.messageText = msg;
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 2500);
  }

  showError(msg: string) {
    this.messageType = 'error';
    this.messageText = msg;
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 2500);
  }
  ngOnDestroy(): void {
    this.cookie.delete('reviewTrainerId')
  }
}

/** Trainer model */
export interface trainerModel {
  name: string;
  trainerId: string;
  rating: number;
  specialities: string[];
}
