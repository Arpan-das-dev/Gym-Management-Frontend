import { booleanAttribute, Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  AllMessageWrapperResponseDto,
  AllReportsList,
  ResolveMessageRequestDto,
} from '../../core/Models/reportServiceModels';
import { ReportAndMessageService } from '../../core/services/report-and-message-service';
import { DatePipe } from '@angular/common';
import {
  faBookmark,
  faCheckCircle,
  faCogs,
  faCommentDots,
  faExclamationCircle,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faFilter,
  faHashtag,
  faRotateLeft,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Navbar } from '../components/navbar/navbar';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberService } from '../../core/services/member-service';
import { TrainerService } from '../../core/services/trainer-service';
import { GenericResponse } from '../../core/Models/genericResponseModels';
import { FormsModule } from '@angular/forms';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-manage-reports',
  imports: [FontAwesomeModule, Navbar, FormsModule, Footer, DatePipe],
  templateUrl: './manage-reports.html',
  styleUrl: './manage-reports.css',
})
export class ManageReports implements OnInit {
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
    eye: faEye,
    eyeSlash: faEyeSlash,
    filter: faFilter,
    rotateLeft: faRotateLeft,
    exclamationTriangle: faExclamationTriangle,
    hash: faHashtag,
    bookmark :faBookmark,
    commentDots : faCommentDots,
    user : faUser,
    xmark : faXmark
  };
  constructor(
    private report: ReportAndMessageService,
    private member: MemberService,
    private trainer: TrainerService
  ) {}
  ngOnInit(): void {
    this.getAllReports();
  }
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
          // console.log(res);
          this.allReports = res.reportsLists;
          this.allReports.forEach((item) => (item.show = false));
          res.reportsLists.forEach((r) => {
            if (r.userRole.toUpperCase() === 'MEMBER') {
              this.memberIdArray.push(r.userId);
            }
            if (r.userRole.toUpperCase() === 'TRAINER') {
              this.fillTrainerProfileImage(r.userId, r.userRole);
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
          this.fillMemberProfileImage(this.memberIdArray);
          // this.fillTrainerProfileImageUrl();
          this.loading = false;
        },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          // console.log('Error Occured ::=>');
          // console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load All Reports Due to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
      });
  }
  applyFilters() {
    this.pageNo = 0;
    this.getAllReports();
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
  nextPage() {
    if (!this.lastPage) {
      this.pageNo++;
      this.getAllReports();
    }
  }

  prevPage() {
    if (this.pageNo > 0) {
      this.pageNo--;
      this.getAllReports();
    }
  }
  profileImageArrayOfMember: ProfileImageModel[] = [];
  mapProfileImageUrl(id: string): string {
    const profileUrl = this.profileImageArrayOfMember.find(
      (m) => m.id === id
    )?.url;
    if (profileUrl) {
      return profileUrl.includes('https') ? profileUrl : 'defaultProfile.png';
    } else {
      return 'defaultProfile.png';
    }
  }
  fillMemberProfileImage(idArray: string[]) {
    if (idArray.length > 0) {
      this.member.getChunksOfMembersProfileImage(idArray).subscribe({
        next: (res: AllMemberProfileImageResponseWrapperDto) => {
          res.memberProfileUrlList.forEach((url) => {
            const index = url.indexOf('_');
            const id = url.substring(index);
            const profileImage = url.substring(0, index).includes('https')
              ? url.substring(0, index)
              : 'defaultProfile.png';
            const data: ProfileImageModel = {
              id: id,
              url: profileImage,
            };
            this.profileImageArrayOfMember.push(data);
          });
        },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          // console.log('Error Occured ::=>');
          // console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load All Profile Image due  to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
      });
    }
  }

  trainerProfileIMageObject: ProfileImageModel[] = [];
  fillTrainerProfileImage(id: string, userRole: string): void {
    let src = '';
    if (userRole === 'TRAINER_PENDING') src = 'defaultProfile.png';
    else {
      this.trainer.getProfileImageByTrainerId(id).subscribe({
        next: (res: GenericResponse) => {
          const rawUrl = res.message;
          src = rawUrl.includes('https') ? rawUrl : 'defaultProfile.png';
          // console.log(src);
          const data: ProfileImageModel = {
            id: id,
            url: src,
          };
          this.trainerProfileIMageObject.push(data);
        },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          // console.log('Error Occured ::=>');
          // console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load All Profile Image due  to Internal Error';
          this.showFullScreenMessage('error', errorMessage);
          src = 'defaultProfile.png';
          const data: ProfileImageModel = {
            id: id,
            url: src,
          };
          this.trainerProfileIMageObject.push(data);
        },
      });
    }
  }

  mapProfileImage(id: string): string {
    const data = this.trainerProfileIMageObject.find((t) => t.id === id);
    return data?.url || 'defaultProfile.png';
  }
  /**
   * section for report resolver
   */
  selectedUserId: string = '';
  selectedRequestId: string = '';
  notify: boolean = false;
  decline: boolean = false;
  mailMessage: string = '';

  showPopup: boolean = false;
  openPopup(data: AllReportsList) {
    // console.log('openPopUpTriggered');

    this.selectedUserId = data.userId;
    this.selectedRequestId = data.requestId;
    this.showPopup = true;
  }

  closePopup() {
    this.selectedUserId = '';
    this.selectedRequestId = '';
    this.showPopup = false;
  }

  resolveOrDecline() {
    if (this.notify) {
      this.mailMessage.length <= 0;
      // console.log(this.mailMessage);
      this.showFullScreenMessage('error', 'Can not Proceed Without Message ');
    }
    this.loading = true;
    const text = this.decline ? 'Declining ' : 'Resolving ';
    this.globalLoadinText = text + 'Your Request';
    const data: ResolveMessageRequestDto = {
      requestId: this.selectedRequestId,
      notify: this.notify,
      decline: this.decline,
      mailMessage: this.mailMessage,
    };
    this.report.markAsResolveOrDecline(this.selectedUserId, data).subscribe({
      next: (res: GenericResponse) => {
        // console.log(res);
        this.closePopup();
        this.getAllReports();
        this.loading = false;
        this.showFullScreenMessage('success', res.message);
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        // console.log('Error Occured ::=>');
        // console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load All Profile Image due  to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }
}
export interface AllMemberProfileImageResponseWrapperDto {
  memberProfileUrlList: string[];
}
export interface ProfileImageModel {
  id: string;
  url: string;
}
