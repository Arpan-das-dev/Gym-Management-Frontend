import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faCamera,
  faCheckCircle,
  faClipboard,
  faClock,
  faCogs,
  faDumbbell,
  faEnvelope,
  faExclamationCircle,
  faFemale,
  faFire,
  faGenderless,
  faIdBadge,
  faMale,
  faMars,
  faPhone,
  faReceipt,
  faTrash,
  faUser,
  faUserShield,
  faUserTie,
  faVenus,
} from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../../core/services/authservice';
import { Router } from '@angular/router';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import {
  LoginStreakResponseDto,
  MemberInfoResponseDto,
  MemberPlanInfoResponseDto,
} from '../../../core/Models/MemberServiceModels';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { WebSocketService } from '../../../core/services/web-socket-service';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { HttpErrorResponse } from '@angular/common/http';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FitDetails } from "../fit-details/fit-details";

@Component({
  selector: 'app-profile-card',
  imports: [NgStyle, FontAwesomeModule, NgClass, NgStyle, DatePipe, FitDetails],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard implements OnInit, OnDestroy {
  roleClass = '';
  genderIcon: IconProp = faGenderless;
  genderMapper(gender: string) {
    switch (gender.toLowerCase()) {
      case 'female':
        this.roleClass = 'text-xl text-rose-600';
        this.genderIcon = faVenus;
        break;
      case 'male':
        this.roleClass = 'text-xl text-blue-600';
        this.genderIcon = faMars;
        break;
      default:
        this.roleClass = 'text-xl text-gray-600';
        this.genderIcon = faGenderless;
        break;
    }
  }
  loading = false;
  showMessage = false;
  messageText = '';
  globalLoadinText = '';
  messageType: 'success' | 'error' = 'success';
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
  icons = {
    member: faUser,
    trainer: faDumbbell,
    admined: faUserShield,
    camera: faCamera,
    trash: faTrash,
    id: faIdBadge,
    user: faUserTie,
    mail: faEnvelope,
    phone: faPhone,
    exclamationCircle: faExclamationCircle,
    checkCircle: faCheckCircle,
    cogs: faCogs,
    fire: faFire,
    male: faMale,
    female: faFemale, receipt: faReceipt, clock : faClock,  calender: faCalendar, clipboard : faClipboard
  };

  userId = '';
  memberDetail: MemberInfoResponseDto = {
    memberId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    frozen: false,
  };

  constructor(
    private authservice: Authservice,
    private router: Router,
    private websocket: WebSocketService,
    private member: MemberService
  ) {}

  interval = 3600 * 1000;
  intervalId: any;
  ngOnInit(): void {
    this.userId = this.authservice.getUserId();
    this.getBasicinfo();
    this.intervalId = setInterval(() => {
      this.setLoginStreak(this.memberDetail.memberId);
      console.log('executed after  1hour');
    }, this.interval);
  }

  getBasicinfo() {
    this.loading = true;
    this.globalLoadinText = 'loding details for your account';
    this.member.getMemberProfile(this.userId).subscribe({
      next: (res: MemberInfoResponseDto) => {
        setTimeout(() => {
          this.memberDetail = res;
          this.genderMapper(res.gender)
          this.getLoginStreak(res.memberId);
          this.getProfileImage(res.memberId, res.gender.toLowerCase());
          this.loading = false;
        });
      },
      error: (err: erroResponseModel) => {
        console.log('an error occured due to ', err.message);
        this.loading = false;
        this.showFullScreenMessage(
          'error',
          err.message || 'an error occured please try again later'
        );
      },
    });
  }

  liveMemberCount = 0;
  liveAdminCount = 0;
  liveTrainerCount = 0;

  loadAllUsersCount() {
    this.websocket.connect('ws://localhost:8080/ws');

    this.websocket.subscribe('/topic/activeMembers', (count) => {
      this.liveMemberCount = count;
      console.log('count is' + count);
    });
  }

  profileImage = '';
  onFileSelected(event: Event) {
    console.log('upload triggered');

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadImage(file);
  }
  uploadImage(file: File) {
    // console.log(this.memberDetail);
    // console.log('user Id =' + this.userId);
    this.globalLoadinText = 'uploading';
    this.loading = true;
    this.member.uploadImage(this.userId, file).subscribe({
      next: (res: genericResponseMessage) => {
        // console.log('image upload successfully to = ' + res.message);
        this.profileImage = res.message || '';
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'profile image uploaded successfully '
        );
      },
      error: (err: erroResponseModel) => {
        this.loading = false;
        console.log(err.message);
        this.showFullScreenMessage(
          'error',
          err.message ||
            'Failed to upload image due to internal issue try again later'
        );
      },
    });
  }

  deletable: boolean = false;
  getProfileImage(memberId: string, gender: string) {
    this.loading = true;
    this.member.getProfileImage(memberId).subscribe({
      next: (res: genericResponseMessage) => {
        if (!res.message || !res.message.includes('http')) {
          this.profileImage =
            gender === 'female' ? 'defaultFemale.png' : 'defaultMale.png';
          this.deletable = false;
        } else {
          this.profileImage = res.message;
          this.deletable = true;
        }
        this.loading = false;
        this.getPlanDetails(memberId);
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to get profile image';
        console.log('error caused due to ', errorMessage);
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  deleteImage() {
    // console.log('delete image triggered');
    this.loading = true;
    this.globalLoadinText = 'deleting';
    const memberId = this.memberDetail.memberId;
    this.member.deleteMemberProfileImage(memberId).subscribe({
      next: (res: genericResponseMessage) => {
        this.getProfileImage(memberId, this.memberDetail.gender);
        this.loading = false;
        const message = res.message || 'image deleted successfully ';
        this.showFullScreenMessage('success', message);
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to delete profile image';
        console.log('error caused due to ', errorMessage);
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  // login streak values
  currentLoginStreak: number = 0;
  maxLoginStreak: number = 0;
  // 1. get LoginStreak
  getLoginStreak(memberId: string) {
    this.loading = true;
    this.globalLoadinText = 'fetching login streak';
    this.member.getLoginStreak(memberId).subscribe({
      next: (res: LoginStreakResponseDto) => {
        // console.log('get the response::', typeof res);
        // console.log(res);
        this.currentLoginStreak = res.logInStreak;
        this.maxLoginStreak = res.maxLogInStreak;
        this.loading = false;
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to load login Streak';
        console.log('error caused due to ', errorMessage);
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  // 2.setLoginStreak
  setLoginStreak(memberId: string) {
    this.member.setLoginStreak(memberId).subscribe({
      next: (res: LoginStreakResponseDto) => {
        // console.log('set login streak and get response :: \n', res);
        this.currentLoginStreak = res.logInStreak;
        this.maxLoginStreak = res.maxLogInStreak;
      },
    });
  }

  // plan details
  planDetails: MemberPlanInfoResponseDto = {
    planDurationLeft: 0,
    planExpiration: '',
    planId: '',
    planName: '',
  };

  getPlanDetails(memberId: string) {
    this.loading = true;
    this.globalLoadinText = 'Fetching Plan infos';
    this.member.getPlaninfo(memberId).subscribe({
      next: (res: MemberPlanInfoResponseDto) => {
        this.loading = false;
        this.showAllertMessage(res.planDurationLeft);
        this.getPlanStatusStyling(res.planDurationLeft);
        // console.log(res);
        this.planDetails = res;
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to planInfo';
        console.log('error caused due to ', errorMessage);
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  showAllertMessage(planDurationLeft: number): void {
    const days = Number(planDurationLeft);
    if (days <= 0) {
      this.showFullScreenMessage(
        'error',
        'Your plan has expired. Please renew or account will be frozen in 10 days'
      );
    } else if (days === 1) {
      this.showFullScreenMessage(
        'error',
        'Your plan expires tomorrow. Please renew soon.'
      );
    } else if (days <= 7) {
      this.showFullScreenMessage(
        'success',
        `Your plan will expire in ${days} day${
          days > 1 ? 's' : ''
        }. Consider renewing soon.`
      );
    } else {
      this.showFullScreenMessage(
        'success',
        `Your plan is active for ${days} more day${days > 1 ? 's' : ''}.`
      );
    }
  }


  getPlanStatusStyling(daysLeft: number) {
  if (daysLeft <= 1) {
    // CRITICAL
    return {
      color: 'text-red-400',
      glow: 'drop-shadow-[0_0_6px_rgba(255,0,0,0.5)]',
      gradient: 'from-red-300 to-red-200',
      iconColor: 'text-red-400',
    };
  } else if (daysLeft <= 15) {
    // WARNING
    return {
      color: 'text-yellow-300',
      glow: 'drop-shadow-[0_0_6px_rgba(255,255,0,0.5)]',
      gradient: 'from-yellow-300 to-amber-200',
      iconColor: 'text-yellow-300',
    };
  } else {
    // SAFE
    return {
      color: 'text-teal-300',
      glow: 'drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]',
      gradient: 'from-teal-300 to-cyan-200',
      iconColor: 'text-teal-300',
    };
  }
}

  ngOnDestroy(): void {
    this.websocket.disconnect();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
