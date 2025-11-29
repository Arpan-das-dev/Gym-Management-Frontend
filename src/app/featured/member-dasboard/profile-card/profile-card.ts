import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoltLightning,
  faCalendar,
  faCamera,
  faCheckCircle,
  faClipboard,
  faClock,
  faCogs,
  faDownload,
  faDumbbell,
  faEnvelope,
  faExclamationCircle,
  faFemale,
  faFire,
  faGenderless,
  faIdBadge,
  faList,
  faMale,
  faMars,
  faPhone,
  faReceipt,
  faTrash,
  faUpload,
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
import { LoadingService } from '../../../core/services/loading-service';
import { NotifyService } from '../../../core/services/notify-service';


@Component({
  selector: 'app-profile-card',
  imports: [NgStyle, FontAwesomeModule, NgClass, NgStyle, DatePipe],
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
    private member: MemberService, private loader : LoadingService, private notify : NotifyService
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
    this.loadAllUsersCount()
    console.log(this.loadAllUsersCount());
    console.log(`members : ${this.liveMemberCount} admin: ${this.liveAdminCount} trainer: ${this.liveTrainerCount}`);
    
    
  }

  getBasicinfo() {
    this.loader.show('loding details for your account', faCogs)

    this.member.getMemberProfile(this.userId).subscribe({
      next: (res: MemberInfoResponseDto) => {
        setTimeout(() => {
          this.memberDetail = res;
          this.genderMapper(res.gender)
          this.getLoginStreak(res.memberId);
          this.getProfileImage(res.memberId, res.gender.toLowerCase());
          this.loader.hide();
          this.notify.showSuccess(`Loded all details for ${res.firstName} ${res.lastName}`)
        });
      },
       error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to save entry';
        console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
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
  this.loader.show('uploading', faUpload);

  this.member.uploadImage(this.userId, file).subscribe({
    next: (res: genericResponseMessage) => {

      if (res.message && res.message.includes("http")) {
        // 🔥 Force browser to load new image (no cache)
        this.profileImage = res.message + '?t=' + performance.now();

        // 🔥 Mark delete as available
        this.canDelete = true;
      } else {
        this.profileImage = this.memberDetail.gender.toLowerCase() === 'female'
          ? 'defaultFemale.png'
          : 'defaultMale.png';
        this.canDelete = false;
      }

      this.loader.hide();
      this.notify.showSuccess('Profile image uploaded successfully');
    },
    error: (error) => {
      const errorMessage = error?.error?.message ?? 'Upload failed';
      this.loader.hide();
      this.notify.showError(errorMessage);
    }
  });
}


 
  canDelete: boolean = false;
  getProfileImage(memberId: string, gender: string) {
    this.loader.show('Fetching Profile Image', faDownload)
    this.member.getProfileImage(memberId).subscribe({
      next: (res: genericResponseMessage) => {
        if (!res.message || !res.message.includes('http')) {
          this.profileImage =
            gender === 'female' ? 'defaultFemale.png' : 'defaultMale.png';
          this.canDelete = false;
        } else {
          this.profileImage = res.message;
          this.canDelete = true;
        }
       this.loader.hide()
        this.getPlanDetails(memberId);
        console.log("is it deletable ?? "+'['+ this.canDelete +']' + res.message);
        
      },
       error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to save entry';
        console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
    });
  }

deleteImage() {
  console.log("DELETE CLICKED!"); // MUST always fire

  if (!this.canDelete) {
    console.log("Delete blocked because canDelete = false");
    return;
  }

  this.loader.show('Deleting image...', this.icons.trash);

  const memberId = this.memberDetail.memberId;

  this.member.deleteMemberProfileImage(memberId).subscribe({
    next: (res) => {
      console.log("DELETE SUCCESS:", res);
      // Wait for S3 consistency
      setTimeout(() => {
        this.getProfileImage(memberId, this.memberDetail.gender);
      }, 300);

      this.loader.hide();
      this.notify.showSuccess(res.message || 'Image deleted successfully');
    },
    error: (err) => {
      console.log("DELETE ERROR:", err);
      this.loader.hide();
      this.notify.showError(err?.error?.message || 'Failed to delete image');
    }
  });
}

  // login streak values
  currentLoginStreak: number = 0;
  maxLoginStreak: number = 0;
  // 1. get LoginStreak
  getLoginStreak(memberId: string) {
    this.loader.show('fetching login streak', faBoltLightning)
    this.member.getLoginStreak(memberId).subscribe({
      next: (res: LoginStreakResponseDto) => {
        // console.log('get the response::', typeof res);
        // console.log(res);
        this.currentLoginStreak = res.logInStreak;
        this.maxLoginStreak = res.maxLogInStreak;
        this.loader.hide()
      },
 error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to save entry';
        console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
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
    this.loader.show('Fetching Plan infos', faList)
    this.member.getPlaninfo(memberId).subscribe({
      next: (res: MemberPlanInfoResponseDto) => {
        this.loader.hide()
        this.showAllertMessage(res.planDurationLeft);
        this.getPlanStatusStyling(res.planDurationLeft);
        // console.log(res);
        this.planDetails = res;
      },
 error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to save entry';
        console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
    });
  }

  showAllertMessage(planDurationLeft: number): void {
    const days = Number(planDurationLeft);
    if (days <= 0) {
      this.notify.showError( 'Your plan has expired. Please renew or account will be frozen in 10 days')
    } else if (days === 1) {
      this.notify.showError('Your plan expires tomorrow. Please renew soon.')
    } else if (days <= 7) {
      this.notify.showError(`Your plan will expire in ${days} day${
          days > 1 ? 's' : ''
        }. Consider renewing soon.`)
      
    } else {
      this.notify.showSuccess( `Your plan is active for ${days} more day${days > 1 ? 's' : ''}.`)
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
