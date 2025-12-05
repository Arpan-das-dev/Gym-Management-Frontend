import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NotifyService } from '../../../core/services/notify-service';
import { LoadingService } from '../../../core/services/loading-service';
import { MemberService } from '../../../core/services/member-service';
import { Authservice } from '../../../core/services/authservice';
import {
  AllSessionInfoResponseDto,
  SessionsResponseDto,
} from '../../../core/Models/SessionServiceModel';
import { faArrowDown, faArrowUp, faCalendar, faClock, faCog } from '@fortawesome/free-solid-svg-icons';
import { errorOutPutMessageModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-session-info',
  imports: [FontAwesomeModule,NgClass],
  templateUrl: './session-info.html',
  styleUrl: './session-info.css',
})
export class SessionInfo implements OnInit{
  memberId: string = '';
  upcomingView: boolean = true;
  icons = {
    calendar : faCalendar,
arrowDown  : faArrowDown,
arrowUp: faArrowUp,
clock : faClock
  }
  constructor(
    private notify: NotifyService,
    private loader: LoadingService,
    private member: MemberService,
    private auth: Authservice
  ) {
    this.memberId = auth.getUserId();
  }
  ngOnInit(): void {
      this.getUpcomingSessions()
  }
  /**
   * here is the section for upcoming sections and we will denote the upcoming sessions as US
   */
  USPageNo: number = 0;
  USPageSize: number = 15;
  UStotalElements: number = 0;
  UStotalPages: number = 0;
  USlastPage: boolean = false;
  USSessions: SessionsResponseDto[] = [];
  getUpcomingSessions() {
    if (!this.USlastPage) {
      this.loader.show('Fetching Session Info', faCog);
      this.member
        .getUpComingSessions(this.memberId, this.USPageNo, this.USPageSize)
        .subscribe({
          next: (res: AllSessionInfoResponseDto) => {
            console.log('res :: \n', res);
            this.USSessions = res.sessionsResponseDtoList;
            this.USPageNo = res.pageNo;
            this.USPageSize = res.pageSize;
            this.UStotalElements = res.totalElements;
            this.UStotalPages = res.totalPages;
            this.USlastPage = res.lastPage;
            this.loader.hide();
            this.notify.showSuccess('Fetched All Upcoming Sessions');
          },
          error: (
            err: errorOutPutMessageModel & { err: HttpErrorResponse }
          ) => {
            console.log(err);
            const message = err?.err?.message
              ? err?.err?.message
              : 'Failed To Upcoming Sessions Due to Internal Server Error';
            this.loader.hide();
            this.notify.showError(message);
          },
        });
    }
  }
  loadNextUpCommingSessions(){
    if(this.USlastPage) {
      this.notify.showError("Last Page Reached")
    }else{
       this.USPageNo++;
    this.getUpcomingSessions()
    }
  }

  loadPreviousUpcomingSessions() {
    if(this.USPageNo === 0) {
      this.notify.showError("No Previous Sessions is Present")
    }else{
      this.USPageNo--;
    this.getUpcomingSessions();
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
  PsSortDirection: string = 'DESC'
  PsSessions: SessionsResponseDto[] = [];

  getPastSessions() {
    this.loader.show('Fetching Past Sessions',faCog)
    this.member.getPastSessions(this.memberId,this.PsPageNo,this.PsPageSize,this.PsSortDirection).subscribe({
        next: (res: AllSessionInfoResponseDto) => {
            console.log('res :: \n', res);
            this.PsSessions = res.sessionsResponseDtoList;
            this.PsPageNo = res.pageNo;
            this.PsPageSize = res.pageSize;
            this.PstotalElements = res.totalElements;
            this.PstotalPages = res.totalPages;
            this.PslastPage = res.lastPage;
            this.loader.hide();
            this.notify.showSuccess('Fetched Past Sessions');
          },
          error: (
            err: errorOutPutMessageModel & { err: HttpErrorResponse }
          ) => {
            console.log(err);
            const message = err?.err?.message
              ? err?.err?.message
              : 'Failed To Load Past Sessions Due to Internal Server Error';
            this.loader.hide();
            this.notify.showError(message);
          },
    })
  }

  loadNextPastSessions(){
if(this.PslastPage) {
      this.notify.showError("Last Page Reached")
    }else{
       this.PsPageNo++;
    this.getUpcomingSessions()
    }
  }
  loadPreviousPastSessions(){
 if(this.PsPageNo === 0) {
      this.notify.showError("No Previous Sessions is Present")
    }else{
      this.PsPageNo--;
    this.getUpcomingSessions();
    }
  }
  // all helper methods
mapDate(dateTime : string) {
  const date = new Date(dateTime)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // 'long' | 'short' | 'narrow'
    day: 'numeric', // 'numeric' | '2-digit'
    month: 'short', // 'long' | 'short' | 'narrow'
    year: 'numeric', // 'numeric' | '2-digit'
    hour: '2-digit', // 'numeric' | '2-digit'
    minute: '2-digit', // 'numeric' | '2-digit'
    hour12: false
  };
  const formattedString = date.toLocaleString('en-US', options);
  return formattedString;
}
}
