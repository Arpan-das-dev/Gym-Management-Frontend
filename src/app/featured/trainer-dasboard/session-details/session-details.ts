import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Authservice } from '../../../core/services/authservice';
import { TrainerService } from '../../../core/services/trainer-service';
import { LoadingService } from '../../../core/services/loading-service';
import { NotifyService } from '../../../core/services/notify-service';
import {
  AllSessionResponseDto,
  AllSessionsWrapperDto,
  UpdateSessionRequestDto,
} from '../../../core/Models/SessionServiceModel';
import {
  faArrowDown,
  faArrowUp,
  faCalendar,
  faClock,
  faCog,
  faEdit,
  faFlag,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  erroResponseModel,
  errorOutPutMessageModel,
} from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericResponse } from '../../../core/Models/genericResponseModels';

@Component({
  selector: 'app-session-details',
  imports: [FontAwesomeModule, NgClass, FormsModule],
  templateUrl: './session-details.html',
  styleUrl: './session-details.css',
})
export class SessionDetails implements OnInit {
  upcomingSessionView: boolean = true;
  trainerId: string = '';
  memberId: string = '';
  upcomingView: boolean = true;
  icons = {
    calendar: faCalendar,
    edit: faEdit,
    trash: faTrash,
    flag: faFlag,
    arrowDown: faArrowDown,
    arrowUp: faArrowUp,
    clock: faClock,
  };
  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private loader: LoadingService,
    private notify: NotifyService
  ) {
    this.trainerId = this.auth.getUserId();
  }
  ngOnInit(): void {
    this.loadAllUpcomingSession();
  }

  /**
   * here is the section for upcoming sections and we will denote the upcoming sessions as US
   */
  USPageNo: number = 0;
  USPageSize: number = 15;
  UStotalElements: number = 0;
  UStotalPages: number = 0;
  USlastPage: boolean = false;
  USSessions: AllSessionResponseDto[] = [];
  loadAllUpcomingSession() {
    this.loader.show('Loading Upcoming Sessions', faCog);
    this.trainer
      .getUpcomingSessions(this.trainerId, this.USPageNo, this.USPageSize)
      .subscribe({
        next: (res: AllSessionsWrapperDto) => {
          console.log('res :: \n', res);
          this.USSessions = res.responseDtoList;
          this.USPageNo = res.pageNo;
          this.USPageSize = res.pageSize;
          this.UStotalElements = res.totalElements;
          this.UStotalPages = res.totalPages;
          this.USlastPage = res.lastPage;
          this.loader.hide();
          this.notify.showSuccess('Fetched All Upcoming Sessions');
        },
        error: (err: errorOutPutMessageModel & { err: HttpErrorResponse }) => {
          console.log(err);
          const message = err?.err?.message
            ? err?.err?.message
            : 'Failed To Upcoming Sessions Due to Internal Server Error';
          this.loader.hide();
          this.notify.showError(message);
        },
      });
  }
  loadNextUpCommingSessions() {
    if (this.USlastPage) {
      this.notify.showError('Last Page Reached');
    } else {
      this.USPageNo++;
      this.loadAllUpcomingSession();
    }
  }

  loadPreviousUpcomingSessions() {
    if (this.USPageNo === 0) {
      this.notify.showError('No Previous Sessions is Present');
    } else {
      this.USPageNo--;
      this.loadAllUpcomingSession();
    }
  }

  /**
   * here is the section for past sessions and we are denoting it as
   * PS
   */

  PsPageNo: number = 0;
  PsPageSize: number = 15;
  PstotalElements: number = 0;
  PstotalPages: number = 0;
  PslastPage: boolean = false;
  PsSortDirection: 'ASC'|'DESC' = 'ASC';
  PsSessions: AllSessionResponseDto[] = [];

  loadAllPastSessions() {
    this.loader.show('Fetching Past Sessions', faCog);
    this.trainer
      .getPastSessions(
        this.trainerId,
        this.PsPageNo,
        this.PsPageSize,
        this.PsSortDirection
      )
      .subscribe({
        next: (res: AllSessionsWrapperDto) => {
          console.log('res :: \n', res);
          this.PsSessions = res.responseDtoList;
          this.PsPageNo = res.pageNo;
          this.PsPageSize = res.pageSize;
          this.PstotalElements = res.totalElements;
          this.PstotalPages = res.totalPages;
          this.PslastPage = res.lastPage;
          this.loader.hide();
          this.notify.showSuccess('Fetched Past Sessions');
        },
        error: (err: errorOutPutMessageModel & { err: HttpErrorResponse }) => {
          console.log(err);
          const message = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load Past Sessions Due to Internal Server Error';
          this.loader.hide();
          this.notify.showError(message);
        },
      });
  }

 
  loadNextPastSessions() {
    if (this.PslastPage) {
      this.notify.showError('Last Page Reached');
    } else {
      this.PsPageNo++;
      this.loadAllPastSessions();
    }
  }
  loadPreviousPastSessions() {
    if (this.PsPageNo === 0) {
      this.notify.showError('No Previous Sessions is Present');
    } else {
      this.PsPageNo--;
      this.loadAllPastSessions();
    }
  }
  // all helper methods
  mapDate(dateTime: string): string {
    const date = new Date(dateTime);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    // Format with locale
    let formatted = date.toLocaleString('en-US', options);

    // Remove the comma before the time → "Dec 6, 2025, 6:00 PM" → "Dec 6, 2025 6:00 PM"
    formatted = formatted.replace(', ', ' ');

    return formatted;
  }
  updateSessionView: boolean = false;
  selectedSession: string = '';
  updateSessionForm: UpdateSessionRequestDto = {
    duration: 0.0,
    memberId: '',
    sessionDate: '',
    sessionName: '',
    trainerId: '',
  };
  openUpdateSessionPopup(session: AllSessionResponseDto) {
    console.log('triggred update session');

    this.updateSessionView = true;
    this.selectedSession = session.sessionId;
    this.updateSessionForm.duration =
      Math.abs(
        new Date(session.sessionEndTime).getTime() -
          new Date(session.sessionStartTime).getTime()
      ) /
      (1000 * 60 * 60);
    this.updateSessionForm.memberId = session.memberId;
    this.updateSessionForm.sessionDate = session.sessionStartTime;
    this.updateSessionForm.sessionName = session.sessionName;
    this.updateSessionForm.trainerId = this.trainerId;
  }
  closeUpdateSessionPopup() {
    this.updateSessionView = false;
    this.selectedSession = '';
    this.updateSessionForm.duration = 0.0;
    this.updateSessionForm.memberId = '';
    this.updateSessionForm.sessionDate = '';
    this.updateSessionForm.sessionName = '';
    this.updateSessionForm.trainerId = '';
  }
  updateSession() {
    if (!this.isFormValid()) {
      this.notify.showError('Please enter valid inputs before submitting.');
      return;
    }
    this.loader.show('Updating Session', faSave);
    this.trainer
      .updateSession(this.updateSessionForm, this.selectedSession)
      .subscribe({
        next: (res: GenericResponse) => {
          console.log(res);
          console.log(`get response from backend is \n ::=> ${res.message}`);
          this.closeUpdateSessionPopup();
          this.loader.hide();
          this.notify.showSuccess(res.message);
          this.loadAllUpcomingSession();
        },
        error: (err: errorOutPutMessageModel & { err: HttpErrorResponse }) => {
          console.log(err);
          const message = err?.err?.message
            ? err?.err?.message
            : 'Failed To Update Session Due to Internal Server Error';
          this.loader.hide();
          this.notify.showError(message);
        },
      });
  }
  isPastDate(dateString: string): boolean {
    const selectedDate = new Date(dateString);
    const currentDate = new Date();
    return selectedDate < currentDate;
  }

  isFormValid(): boolean {
    return (
      typeof this.updateSessionForm.sessionName === 'string' &&
      this.updateSessionForm.sessionName.trim().length > 0 &&
      typeof this.updateSessionForm.sessionDate === 'string' &&
      this.updateSessionForm.sessionDate.length > 0 &&
      !this.isPastDate(this.updateSessionForm.sessionDate) &&
      !isNaN(Number(this.updateSessionForm.duration)) &&
      Number(this.updateSessionForm.duration) >= 0.5 &&
      Number(this.updateSessionForm.duration) <= 2.5
    );
  }

  deletePopup: boolean = false;
  deleteTargetSessionId: string = '';

  openDeletePopup(sessionId: string) {
    this.deleteTargetSessionId = sessionId;
    this.deletePopup = true;
  }
  closeDeletePopUp() {
    this.deletePopup = false;
    this.deleteTargetSessionId = '';
  }
  confirmDeleteSession() {
    console.log('delete session triggered');
    this.loader.show('Deleting Session', faTrash);
    this.trainer
      .deleteSession(this.deleteTargetSessionId, this.trainerId)
      .subscribe({
        next: (res: GenericResponse) => {
          console.log(`fetched response from backend ::-> ${res.message}`);
          this.closeDeletePopUp();
          this.loadAllUpcomingSession();
          this.loader.hide();
          this.notify.showSuccess(res.message);
        },
        error: (err: HttpErrorResponse) => {
          this.loader.hide();
          const errorBody: erroResponseModel | undefined = err.error;
          let messageToShow = 'Failed To add Session Due to unknown error';
          if (errorBody && errorBody.message) {
            messageToShow = errorBody.message;
            console.log('Backend Error Message:', messageToShow);
          } else {
            messageToShow = err.message || messageToShow;
            console.error('Unknown error structure:', err);
          }
          this.notify.showError(messageToShow);
        },
      });
  }

  statusPopupVisible = false;
  selectedSessionIdForStatus = '';
  updateSessionStatus = '';
  openStatusPopup(sessionId: string) {
    this.selectedSessionIdForStatus = sessionId;
    this.updateSessionStatus = '';
    this.statusPopupVisible = true;
  }
  closeStatusPopup() {
    this.statusPopupVisible = false;
    this.selectedSessionIdForStatus = '';
    this.updateSessionStatus = '';
  }
  submitStatusUpdate() {
    if (!this.updateSessionStatus) {
      this.notify.showError('Please select a valid status.');
      return;
    }
    this.updateStatus(this.selectedSessionIdForStatus)
  }
  updateStatus(sessionId: string) {
    console.log(`update session status triggered`);
    this.loader.show('Updating Status',faCog);
    this.trainer.updateSessionStatus(sessionId,this.trainerId,this.updateSessionStatus).subscribe({
      next: (res: GenericResponse) => {
          console.log(`fetched response from backend ::-> ${res.message}`);          
          if(this.upcomingView){
            console.log("loading upcoming sessions");
            this.loadAllUpcomingSession();
          }else{
            console.log("loading past sessions");            
            this.loadAllPastSessions()
          }
          this.closeStatusPopup();
          this.loader.hide();
          this.notify.showSuccess(res.message);
        },
        error: (err: HttpErrorResponse) => {
          this.loader.hide();
          const errorBody: erroResponseModel | undefined = err.error;
          let messageToShow = 'Failed To Update status due to internal server error';
          if (errorBody && errorBody.message) {
            messageToShow = errorBody.message;
            console.log('Backend Error Message:', messageToShow);
          } else {
            messageToShow = err.message || messageToShow;
            console.error('Unknown error structure:', err);
          }
          this.notify.showError(messageToShow);
        },
    })
  }
}
