import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { MemberService } from '../../../core/services/member-service';
import { LoadingService } from '../../../core/services/loading-service';
import { NotifyService } from '../../../core/services/notify-service';
import {
  faCalendar,
  faCalendarPlus,
  faCheckCircle,
  faCog,
  faIdCard,
  faPlus,
  faSync,
  faTimesCircle,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { TrainerInfoResponseDto } from '../../../core/Models/MemberServiceModels';
import { erroResponseModel, errorOutPutMessageModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerAssignRequestDto } from '../../../core/Models/TrainerServiceModels';
import { GenericResponse } from '../../../core/Models/genericResponseModels';
import { TrainerService } from '../../../core/services/trainer-service';

@Component({
  selector: 'app-trainer-info',
  imports: [FontAwesomeModule, NgClass, FormsModule],
  templateUrl: './trainer-info.html',
  styleUrl: './trainer-info.css',
})
export class TrainerInfo implements OnInit {
  /** Member ID of logged-in user */
  memberId: string = '';

  /** Holds trainer details */
  trainer: TrainerInfoResponseDto = {
    trainerId: '',
    trainerName: '',
    profileImageUrl: '',
    eligibilityDate: '',
  };

  /** Trainer active flag */
  trainerActive: boolean = true;

  /** Trainer availability state */
  trainerStatus: 'available' | 'unavailable' | 'busy' = 'available';

  /** Icons */
  icons = {
    userTie: faUserTie,
    idCard: faIdCard,
    calendar: faCalendar,
    calendarPlus: faCalendarPlus,
    checkCircle: faCheckCircle,
    timesCircle: faTimesCircle,
    plus: faPlus,
  };

  constructor(
    private auth: Authservice,
    private member: MemberService,
    private loader: LoadingService,
    private notify: NotifyService,
    private router: Router,
    private trainerService : TrainerService
  ) {
    this.memberId = this.auth.getUserId();
  }

  /** Load trainer info on init */
  ngOnInit(): void {
    this.loadTrainerData();
  }

  /** Fetch trainer info from backend */
  loadTrainerData() {
    this.loader.show("Loading Trainer's Info", faCog);

    this.member.getTrainerInfo(this.memberId).subscribe({
      next: (res: TrainerInfoResponseDto) => {
        this.trainer = res;
        this.getStatusOfTrainer(res.trainerId)
        this.loader.hide();
        this.notify.showSuccess("Fetched Trainer's Details Successfully");
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        const message = err?.err?.message || 'No Trainer Found With Your Id';
        this.trainerActive = false;
        this.loader.hide();
        this.notify.showError(message);
      },
    });
  }

  /** Confirm + Extend date handler */
  confirmExtendDate() {
    const confirmMsg = 'Are you sure you want to extend trainer eligibility?';
    if (!confirm(confirmMsg)) {
      return;
    }

    this.extendTrainerDate();
  }

  /** Returns days left with the trainer */
  getDaysLeft(date: string): number {
    const today = new Date();
    const end = new Date(date);
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  showExtendModal = false;
  /** Calls backend to extend eligibility */
  extendTrainerDate() {
    this.loader.show('Sending Request To Admin', faCog);
    const data: TrainerAssignRequestDto = {
      memberId: this.memberId,
      requestDate: new Date().toISOString(),
      trainerId: this.trainer.trainerId,
      trainerName: this.trainer.trainerName,
      trainerProfileImageUrl: this.trainer.profileImageUrl,
    };
    this.member.requestToGetCoach(data).subscribe({
      next: (res: GenericResponse) => {
        console.log(`get the response from backend is ${res.message}`);
        this.loader.hide();
        this.notify.showSuccess(res.message);
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Request Admin Due to Internal Error';
        this.loader.hide();
        this.notify.showError(errorMessage);
      },
    });
  }
  requestTrainer() {
    this.router.navigate(['ourTrainers']);
  }

  getStatusOfTrainer(trainerId : string){
    this.loader.show('Getting Trainer Status', faCog);
    this.trainerService.getStatus(trainerId).subscribe({
      next:(res: GenericResponse) => {
        console.log(`Get status from backend ${res.message}`);
        console.log(res);
        this.trainerStatus = (res.message.toLowerCase() as 'available' | 'unavailable' | 'busy') || 'unavailable';
        if(res.message==='UNAVAILABLE') {
          this.trainerActive = false;
        } else{
          this.trainerActive = true 
        }
        console.log(`current trainer status is ::-> ${this.trainerActive}`);
        
        this.loader.hide();
        this.notify.showSuccess('Successfully Retrieved Trainer status'); 
      }, error:(err: errorOutPutMessageModel & {err: HttpErrorResponse}) => {
        console.log(err);
        const message = err.err.message ? err.err.message : 'Failed To Load Trainer Status Due to Internal Server Error';
        this.loader.hide();
        this.notify.showError(message);        
      }
    })
  }
}
