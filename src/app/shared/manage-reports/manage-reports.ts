import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  AllMessageWrapperResponseDto,
  AllReportsList,
} from '../../core/Models/reportServiceModels';
import { ReportAndMessageService } from '../../core/services/report-and-message-service';
import { NgClass } from '@angular/common';
import {
  faCheckCircle,
  faCogs,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Navbar } from '../components/navbar/navbar';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manage-reports',
  imports: [FontAwesomeModule, NgClass, Navbar],
  templateUrl: './manage-reports.html',
  styleUrl: './manage-reports.css',
})
export class ManageReports {
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
  };
  constructor(private report: ReportAndMessageService) {}
  memberIdArray: string[] = [];
  trainerIdArray: string[] = [];
  allReports: AllReportsList[] = [];
  pageNo: number = 0;
  pageSize: number = 30;
  sortDirection: 'ASC' | 'DESC' = 'DESC';
  sortBy: string = 'messageTime';
  role: string = 'ALL';
  status: string = 'ALL';
  totalElements: number = 0;
  totalPages: number = 0;
  lastPage: boolean = false;

  getAllReports() {
    this.loading = true;
    this.globalLoadinText = 'Fetching All Reports';
    this.report
      .getAllRequestForAdmin(
        this.pageNo,
        this.pageSize,
        this.sortBy,
        this.sortDirection,
        this.role,
        this.status
      )
      .subscribe({
        next: (res: AllMessageWrapperResponseDto) => {
          console.log(res);
          this.allReports = res.reportsLists;
          res.reportsLists.forEach((r) => {
            if (r.userRole.toUpperCase() === 'MEMBER') {
              this.memberIdArray.push(r.userId);
            }
            if (r.userRole.toUpperCase() === 'TRAINER') {
              this.memberIdArray.push(r.userId);
            }
          });
          this.pageNo = res.pageNo;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.lastPage = res.lastPage;
          this.showFullScreenMessage(
            'success',
            'Successfully Fetched All Reports'
          );
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
      });
  }
  restParameters() {
    this.pageNo = 0;
    this.pageSize = 30;
    this.sortBy = 'messageTime';
    this.sortDirection = 'DESC';
    this.role = 'ALL';
    this.status = 'ALL';
    this.getAllReports();
  }
  filMemberProfileImage(idArray:string[]){
    
  }
}
