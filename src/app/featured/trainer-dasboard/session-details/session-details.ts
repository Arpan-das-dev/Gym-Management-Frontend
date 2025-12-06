import { NgClass, NgStyle } from '@angular/common';
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
} from '../../../core/Models/SessionServiceModel';
import { faArrowDown, faArrowUp, faCalendar, faClock, faCog } from '@fortawesome/free-solid-svg-icons';
import { errorOutPutMessageModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-session-details',
  imports: [FontAwesomeModule, NgClass, NgStyle, FormsModule],
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
  ngOnInit(): void {}

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
  PsSortDirection: string = 'ASC';
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

   loadNextPastSessions(){
if(this.PslastPage) {
      this.notify.showError("Last Page Reached")
    }else{
       this.PsPageNo++;
    this.loadAllPastSessions()
    }
  }
  loadPreviousPastSessions(){
 if(this.PsPageNo === 0) {
      this.notify.showError("No Previous Sessions is Present")
    }else{
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
    hour12: true
  };

  // Format with locale
  let formatted = date.toLocaleString('en-US', options);

  // Remove the comma before the time → "Dec 6, 2025, 6:00 PM" → "Dec 6, 2025 6:00 PM"
  formatted = formatted.replace(", ", " ");

  return formatted;
}
}
