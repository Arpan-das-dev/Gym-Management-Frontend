import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faCogs,
  faEnvelope,
  faExclamationCircle,
  faEye,
  faEyeSlash,
  faIdBadge,
  faLock,
  faLockOpen,
  faMars,
  faPhone,
  faRotateRight,
  faStar,
  faTrash,
  faUsers,
  faVenus,
} from '@fortawesome/free-solid-svg-icons';
import {
  AllMemberResponseWrapperDto,
  AllTrainerResponseDto,
  AllTrainerResponseDtoWrapper,
  MemberResponseDto,
} from '../../../core/Models/TrainerServiceModels';
import { TrainerService } from '../../../core/services/trainer-service';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { GenericResponse } from '../../../core/Models/genericResponseModels';
import { AdminService } from '../../../core/services/admin-service';
import { MailService } from '../../../core/mail-service';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { FormsModule } from '@angular/forms';
import { MemberStatus } from '../../../core/Models/MemberServiceModels';
import { MemberService } from '../../../core/services/member-service';

@Component({
  selector: 'app-trainer-manager',
  imports: [FontAwesomeModule, NgClass, Navbar, Footer, FormsModule],
  templateUrl: './trainer-manager.html',
  styleUrl: './trainer-manager.css',
})
export class TrainerManager implements OnInit {
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
  // boolean values for better ui and animations
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  icons = {
    refresh: faRotateRight,
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    delete: faTrash,
    freeze: faLock,
    unFreeze: faLockOpen,
    mail: faEnvelope,
    eye: faEye,
    eyeSlash: faEyeSlash,
    female: faVenus,
    male: faMars,
    clients: faUsers,
    id: faIdBadge,
    phone: faPhone,
    star: faStar,
  };
  constructor(
    private trainer: TrainerService,
    private admin: AdminService,
    private mailService: MailService,
    private member: MemberService
  ) {}
  ngOnInit(): void {
    this.fetchAllTrainers();
  }
  trainers: AllTrainerResponseDto[] = [];
  activeStatus: activeStatus[] = [];
  fetchAllTrainers() {
    this.loading = true;
    this.messageText = 'Loaiding trainers...';
    this.trainer.getAdminInfoForAllTrainers().subscribe({
      next: (res: AllTrainerResponseDtoWrapper) => {
        console.log("fetched all trainer's from backend ");
        console.log(res);
        this.trainers = res.allTrainerResponseDtoWrappers.map((trainer) => {
          trainer.show = false;
          trainer.clientViewMode = false;
          this.activeTrainer(trainer.id);
          return trainer;
        });
        this.loading = false;
        this.showFullScreenMessage('success', 'Trainers loaded successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.log('an error occured due to ', err);
        this.catchError(err, 'Failed to load trainers');
      },
    });
  }

  isActive(trainerId: string): activeStatus {
    const data = this.activeStatus.find(
      (status) => status.trainerId === trainerId
    );
    if (data) {
      return data;
    } else {
      return {
        trainerId: trainerId,
        status: 'UNAVAILABLE',
        active: false,
      };
    }
  }

  // returns array for full stars
  getFullStars(rating: number | null | undefined): number[] {
    const value = rating ?? 0;
    return Array(Math.floor(value)).fill(0);
  }

  // returns true if half star should be shown
  hasHalfStar(rating: number | null | undefined): boolean {
    const value = rating ?? 0;
    return value % 1 >= 0.5;
  }

  showDetails(trainerId: string) {
    let trainer = this.trainers.find((t) => t.id === trainerId);
    if (trainer) {
      trainer.show = !trainer.show;
      trainer.clientViewMode = false;
      this.trainer.getTrainerClientCount(trainerId).subscribe({
        next: (res: GenericResponse) => {
          console.log(res);
          const count: string = res.message || '0';
          trainer!.clientCount = parseInt(count);
        },
        error: (err: HttpErrorResponse) => {
          console.log('an error occured due to ', err);
          this.catchError(err, "  Failed to load trainer's client count");
        },
      });
    }
  }
  mapProfileImage(url: string, gender: string): string {
    const gend: string = gender.trim().toUpperCase();
    if (url && url.trim().length > 0) {
      if (url.includes('https') || url.includes('http')) {
        return url;
      } else {
        switch (gend) {
          case 'MALE':
            return 'defaultMale.png';
          case 'FEMALE':
            return 'defaultFemale.png';
          default:
            return 'defaultProfile.png';
        }
      }
    } else {
      switch (gend) {
        case 'MALE':
          return 'defaultMale.png';
        case 'FEMALE':
          return 'defaultFemale.png';
        default:
          return 'defaultProfile.png';
      }
    }
  }
  freezableTrainerId: string = '';
  freeze: boolean = false;
  showFreezePopup: boolean = false;
  openFreezePopup(trainerId: string, value: boolean) {
    this.freezableTrainerId = trainerId;
    this.freeze = value;
    this.showFreezePopup = true;
  }
  closeFreezePopup() {
    this.freezableTrainerId = '';
    this.showFreezePopup = false;
  }
  freezeOrUnFreeze() {
    this.loading = true;
    this.messageText = this.freeze
      ? 'Freezing trainer...'
      : 'Unfreezing trainer...';
    this.trainer
      .freezeOrUnfreezeTrainer(this.freezableTrainerId, this.freeze)
      .subscribe({
        next: (res: GenericResponse) => {
          this.loading = false;
          this.showFullScreenMessage(
            'success',
            res.message || 'Trainer status updated successfully'
          );
          this.trainers = this.trainers.map((trainer) => {
            if (trainer.id === this.freezableTrainerId) {
              trainer.frozen = this.freeze;
            }
            return trainer;
          });
          this.closeFreezePopup();
        },
        error: (err: HttpErrorResponse) => {
          console.log('an error occured due to ', err);
          this.catchError(err, 'Failed to update trainer status');
        },
      });
  }
  deletableTrainerId: string = '';
  showDeletePopup: boolean = false;
  openDeletPopup(trainerId: string) {
    this.deletableTrainerId = trainerId;
    this.showDeletePopup = true;
  }
  closeDeletePopup() {
    this.deletableTrainerId = '';
    this.showDeletePopup = false;
  }
  deleteTrainer() {
    this.loading = true;
    this.messageText = 'Deleting trainer...';
    this.admin.deleteUser(this.deletableTrainerId, 'TRAINER').subscribe({
      next: (res: GenericResponse) => {
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          res.message || 'Trainer deleted successfully'
        );
        this.trainers = this.trainers.filter(
          (trainer) => trainer.id !== this.deletableTrainerId
        );
        this.closeDeletePopup();
      },
      error: (err: HttpErrorResponse) => {
        console.log('an error occured due to ', err);
        this.catchError(err, 'Failed to delete trainer');
      },
    });
  }
  activeTrainer(trainerId: string): void {
    this.loading = true;
    this.messageText = 'Loading trainer status...';
    this.trainer.getStatus(trainerId).subscribe({
      next: (res: GenericResponse) => {
        const status: string = res.message || 'UNAVAILABLE';
        const isActive: boolean =
          status.toUpperCase() === 'UNAVAILABLE' ? false : true;
        const dataObject: activeStatus = {
          trainerId: trainerId,
          status: status,
          active: isActive,
        };
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'Trainer status loaded successfully'
        );
        this.activeStatus.push(dataObject);
      },
      error: (err: HttpErrorResponse) => {
        console.log('an error occured due to ', err);
        this.catchError(err, 'Failed to load trainers');
        const dataObject: activeStatus = {
          trainerId: trainerId,
          status: 'UNAVAILABLE',
          active: false,
        };
        this.activeStatus.push(dataObject);
      },
    });
  }
  selectedTrainer!: AllTrainerResponseDto;
  mailSubject: string = '';
  mailMessage: string = '';
  mailPopupOpen: boolean = false;

  openMailPopup(t: AllTrainerResponseDto) {
    this.selectedTrainer = t;
    this.mailSubject = '';
    this.mailMessage = '';
    this.mailPopupOpen = true;
  }

  closeMailPopup() {
    this.mailPopupOpen = false;
  }
  sendMail() {
    if (!this.mailSubject.trim() || !this.mailMessage.trim()) {
      this.showFullScreenMessage(
        'error',
        'Subject and message cannot be empty.'
      );
      return;
    }
    this.loading = true;
    this.mailService
      .sendMail(
        this.selectedTrainer.email,
        this.mailSubject.trim(),
        this.mailMessage.trim()
      )
      .subscribe({
        next: (res: GenericResponse) => {
          console.log(res);
          this.loading = false;
          const message = res.message ? res.message : 'Mail sent successfully.';
          this.showFullScreenMessage('success', message);
          this.closeMailPopup();
        },
        error: (err: HttpErrorResponse) => {
          console.log('an error occured due to ', err);
          this.catchError(
            err,
            `Failed to send mail ${this.selectedTrainer.firstName} ${this.selectedTrainer.lastName}`
          );
        },
      });
  }

  clients: MemberResponseDto[] = [];
  arrayId: string[] = [];
  loadAllClients(trainer: AllTrainerResponseDto) {
    this.loading = true;
    this.messageText = `Loading Clients Info for ${trainer.firstName} ${trainer.lastName}...`;
    this.trainer.viewAllClients(trainer.id).subscribe({
      next: (res: AllMemberResponseWrapperDto) => {
        console.log(
          `fetched ${res.memberResponseDtoList.length} clients from backend`
        );
        console.log(res);
        this.clients = res.memberResponseDtoList;
        res.memberResponseDtoList.forEach((c) => this.arrayId.push(c.memberId));
        this.loading = false;
        this.isClientsActive();
        this.showFullScreenMessage(
          'success',
          'Successfully Loaded All Clients'
        );
      },
      error: (err: HttpErrorResponse) => {
        console.log('an error occured due to ', err);
        this.catchError(
          err,
          `Failed to load clients for ${trainer.firstName} ${trainer.lastName}`
        );
      },
    });
  }

  getClients(trainerId: string): MemberResponseDto[] {
    return this.clients.filter((c) => c.trainerId === trainerId);
  }
  activeClientTrainerId: string | null = null;

toggleClientView(trainer: AllTrainerResponseDto) {
  console.log('toggle view triggered for', trainer.id);

  // 1️⃣ Close previously opened trainer (if different)
  if (
    this.activeClientTrainerId &&
    this.activeClientTrainerId !== trainer.id
  ) {
    const prevTrainer = this.trainers.find(
      t => t.id === this.activeClientTrainerId
    );

    if (prevTrainer) {
      prevTrainer.clientViewMode = false;
    }

    this.clearClientData();
  }

  // 2️⃣ If clicking same trainer → toggle OFF
  if (trainer.clientViewMode) {
    trainer.clientViewMode = false;
    this.activeClientTrainerId = null;
    this.clearClientData();
    return;
  }

  // 3️⃣ Open new trainer client view
  trainer.clientViewMode = true;
  trainer.show = false;
  this.activeClientTrainerId = trainer.id;
  this.clearClientData();
  this.loadAllClients(trainer);
}
  clientStatus: MemberStatus[] = [];
  isClientsActive() {
    console.log('loading client ');
    this.member.isActiveClients(this.arrayId).subscribe({
      next: (res: MemberStatus[]) => {
        console.log(res);
        this.clientStatus = res;
      },
      error: (err: HttpErrorResponse) => {
        console.log('an error occured due to ', err);
        this.catchError(err, `Failed to load status`);
      },
    });
  }
  clearClientData() {
    this.clientStatus = [];
    this.arrayId = [];
    this.clients = [];
  }
  isMemberActive(memberId: string): boolean {
    return (
      this.clientStatus.find((m) => m.memberId === memberId)?.active ?? false
    );
  }

  deleteClentPopup: boolean = false;
  memberToDelete!: MemberResponseDto;
  trainerOfMember!: AllTrainerResponseDto;
  openDeleteClientPopup(
    trainer: AllTrainerResponseDto,
    member: MemberResponseDto
  ) {
    this.memberToDelete = member;
    this.trainerOfMember = trainer;
    this.deleteClentPopup = true;
  }
  closeDeleteClientPopup() {
    this.memberToDelete = undefined!;
    this.trainerOfMember = undefined!;
    this.deleteClentPopup = false;
  }
  deleteCilentForTrainer() {
    this.loading = true;
    this.messageText = `Removing client ${this.memberToDelete.memberName} from trainer ${this.trainerOfMember.firstName} ${this.trainerOfMember.lastName}...`;
    this.admin
      .deleteClientFromTrainer(
        this.trainerOfMember.id,
        this.memberToDelete.memberId,
        true
      )
      .subscribe({
        next: (res: GenericResponse) => {
          console.log(res);
          this.loading = false;
          const message = res.message
            ? res.message
            : 'Client removed successfully.';
          this.showFullScreenMessage('success', message);
          this.clients = this.clients.filter(
            (c) => c.memberId !== this.memberToDelete.memberId
          );
        },
        error: (err: HttpErrorResponse) => {
          console.log('an error occured due to ', err);
          this.catchError(
            err,
            `Failed to remove client ${this.memberToDelete.memberName} from trainer ${this.trainerOfMember.firstName} ${this.trainerOfMember.lastName}`
          );
        },
      });
  }

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
  showError(msg: string) {
    this.messageType = 'error';
    this.messageText = msg;
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 2500);
  }
}
export interface activeStatus {
  trainerId: string;
  status: string;
  active: boolean;
}
