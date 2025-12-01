import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCamera,
  faCogs,
  faDownload,
  faDumbbell,
  faEnvelope,
  faGenderless,
  faIdBadge,
  faMars,
  faPhone,
  faTrash,
  faUpload,
  faUser,
  faUserShield,
  faVenus,
} from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../../core/services/authservice';
import { TrainerService } from '../../../core/services/trainer-service';
import { NotifyService } from '../../../core/services/notify-service';
import { LoadingService } from '../../../core/services/loading-service';
import { TrainerResponseDto } from '../../../core/Models/TrainerServiceModels';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { WebSocketService } from '../../../core/services/web-socket-service';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import {
  GenericResponse,
  genericResponseMessage,
} from '../../../core/Models/genericResponseModels';

@Component({
  selector: 'app-profile-cardT',
  imports: [FontAwesomeModule, NgStyle, NgClass],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard implements OnInit {
  // user id (trainer id ) which is responsible to do operations for the rest of the class
  trainerId = '';
  // constructor
  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private notify: NotifyService,
    private loader: LoadingService,
    private websocket: WebSocketService
  ) {}
  // implent ngOnInit to load required things when page loads
  ngOnInit(): void {
    this.trainerId = this.auth.getUserId();
    setTimeout(() => {
      this.loadTrainerInfo();
    }, 500);
    console.log('role class is ==> ', this.roleClass);
  }
  // global icons for profile card
  icons = {
    camera: faCamera,
    trash: faTrash,
    id: faIdBadge,
    member: faUser,
    trainer: faDumbbell,
    admined: faUserShield,
    user: faUser,
    mail: faEnvelope,
    phone: faPhone,
  };
  /**
   * profile image sections responsible to
   * get, upload and delete profile image for trainer
   */
  profileImage = '';
  canDelete: boolean = false;
  profileImageMapper(profileUrl: string | undefined, gender: string) {
    // handle missing profileUrl first
    if (!profileUrl) {
      if (gender === 'female') {
        this.profileImage = 'defaultFemale.png';
      } else {
        this.profileImage = 'defaultMale.png';
      }
      this.canDelete = false;
      return;
    }

    if (profileUrl.includes('http')) {
      this.profileImage = profileUrl;
      this.canDelete = true;
    } else {
      if (gender === 'female') {
        this.profileImage = 'defaultFemale.png';
      } else {
        this.profileImage = 'defaultMale.png';
      }
      this.canDelete = false;
    }
  }
  onFileSelected(event: Event) {
    console.log('upload triggered');

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadImage(file);
  }
  uploadImage(file: File) {
    this.loader.show('Uploading Image..', faUpload);
    this.trainer.uploadNewProfileImage(this.trainerId, file).subscribe({
      next: (res: genericResponseMessage) => {
        console.log('uploaded image successfully');
        console.log(res);
        this.profileImageMapper(res.message || '', this.trainerDetail.gender);
        this.loader.hide();
        this.notify.showSuccess('Image Uploaded SuccessFully');
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to Upload Image Due to Aws Service Issue';
        console.log(error);
        this.loader.hide();
        this.notify.showError(errorMessage);
      },
    });
  }
  getProfileImage() {
    this.loader.show('Fetching Profile Image', faDownload);
    this.trainer.getProfileImageByTrainerId(this.trainerId).subscribe({
      next: (res: GenericResponse) => {
        console.log(res);
        this.profileImageMapper(res.message, this.trainerDetail.gender);
        this.loader.hide();
        this.notify.showSuccess('Successfully Fetched Your Profile Image');
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to Load Profile Image Due to Internal Issue';
        console.log('failed to load due to>>');
        console.log(error);
        this.profileImageMapper('', this.trainerDetail.gender);
        this.loader.hide();
        this.notify.showError(errorMessage);
      },
    });
  }
  deleteImage() {
    this.loader.show('Deleteing Image', faTrash);
    this.trainer.deleteProfileImage(this.trainerId).subscribe({
      next: (res: genericResponseMessage) => {
        this.profileImageMapper('', this.trainerDetail.gender);
        const message =
          res.message || 'SuccessFully Deleted Your Profile Image';
        this.loader.hide();
        this.notify.showSuccess(message);
      },
      // error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
      //   const errorMessage = error?.error?.message ? error.error.message : 'Failed to Delete Your Image';
      //   console.log(error);
      //   this.loader.hide()
      //   this.notify.showError(errorMessage)
      // }
    });
  }

  /**
   * profile basic info details
   * which will show case trainer's basic details
   * which is mostly read only and also allow to update on some feilds too
   * eg: specialites, status
   */
  genderIcon: IconProp = faGenderless;
  roleClass: string = '';
  genderMapper(gender: string) {
    switch (gender.toLowerCase()) {
      case 'female':
        this.roleClass = 'text-xl text-rose-600';
        this.genderIcon = faVenus;
        console.log("current gender is ",gender);
        
        break;
      case 'male':
        this.roleClass = 'text-xl text-blue-600';
        this.genderIcon = faMars;
        console.log("current gender is ",gender);
        
        break;
      default:
        this.roleClass = 'text-xl text-gray-600';
        this.genderIcon = faGenderless;
        console.log("current gender is ",gender);
        
        break;
    }
  }
  trainerDetail: TrainerResponseDto = {
    trainerId: '',
    trainerProfileImageUrl: '',
    firstName: '',
    lastName: '',
    emailId: '',
    phone: '',
    gender: '',
    lastLoginTime: '',
    available: false,
    averageRating: 0,
  };
  loadTrainerInfo() {
    this.loader.show('Loading Your Account Details', faCogs);
    this.trainer.getTrainerById(this.trainerId).subscribe({
      next: (res: TrainerResponseDto | any) => {
        console.log('fetched from backend ::=>');
        console.log(res);
        this.trainerDetail = res;
        if (res.gender.toLowerCase() === 'female') {
          this.genderIcon = faVenus;
        } else {
          this.genderIcon = faMars;
        }
        this.genderMapper(res.gender)
        this.loader.hide();
        this.notify.showSuccess('SuccessFully Loaded Your account Details');
        this.getProfileImage();
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to Load Users Info';
        console.log(error);
        this.loader.hide();
        this.notify.showError(errorMessage);
      },
    });
  }

  liveMemberCount = 0;
  liveAdminCount = 0;
  liveTrainerCount = 0;

  loadLiveUsersCount() {
    this.websocket.connect('ws://localhost:8080/ws');

    this.websocket.subscribe('/topic/activeMembers', (count) => {
      this.liveMemberCount = count;
      console.log('count is' + count);
    });
  }
}
