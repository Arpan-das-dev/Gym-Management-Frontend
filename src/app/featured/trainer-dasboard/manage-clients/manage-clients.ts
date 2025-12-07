import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faSave,
  faUsers,
  faUserSlash,
} from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../../core/services/authservice';
import { TrainerService } from '../../../core/services/trainer-service';
import { NotifyService } from '../../../core/services/notify-service';
import { LoadingService } from '../../../core/services/loading-service';
import { AllMemberResponseWrapperDto, MemberResponseDto } from '../../../core/Models/TrainerServiceModels';
import { erroResponseModel, errorOutPutMessageModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { AddSessionRequestDto } from '../../../core/Models/SessionServiceModel';
import { GenericResponse } from '../../../core/Models/genericResponseModels';
import { MemberStatus } from '../../../core/Models/MemberServiceModels';
import { MemberService } from '../../../core/services/member-service';

@Component({
  selector: 'app-manage-clients',
  imports: [FontAwesomeModule, NgStyle, DatePipe, FormsModule,NgClass],
  templateUrl: './manage-clients.html',
  styleUrl: './manage-clients.css',
})
export class ManageClients implements OnInit {
  trainerId : string = ''
  icons = {
    users: faUsers,
    plus: faPlus,
    userSlash: faUserSlash,
  };
  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private notify: NotifyService,
    private loader: LoadingService,
    private member : MemberService
  ) {
    this.trainerId = this.auth.getUserId()
  }

  ngOnInit(): void {
      this.loadAllClients()
      if(this.arrayId.length>0 && this.clients.length>0) {
        const seconds: number = 10 * 60;
        setInterval(()=> this.isClientsActive,seconds*1000)
      }
  }

  clients : MemberResponseDto[] = []
  arrayId : string[] = []
  loadAllClients() {
    this.loader.show("Loading Clients Info",faUsers)
    this.trainer.viewAllClients(this.trainerId).subscribe({
      next:(res: AllMemberResponseWrapperDto) => {
        console.log(`fetched ${res.memberResponseDtoList.length} clients from backend`);
        console.log(res);
        this.clients = res.memberResponseDtoList;
        res.memberResponseDtoList.forEach(c=> this.arrayId.push(c.memberId))
        this.loader.hide();
        this.isClientsActive()
        this.notify.showSuccess("Successfully Loaded All of your Clients")        
      }, error:(err: erroResponseModel & {err: HttpErrorResponse}) => {
        const message = err.err.message ? err.err.message : 'Failed To Load Your Clients Info';
        console.log(`An Error Occured due to ${message}`);
        this.loader.hide();
        this.notify.showError(message)        
      }
    })
  }

  clientStatus : MemberStatus [] = []
  isClientsActive () {
    console.log("loading client ");
    this.member.isActiveClients(this.arrayId).subscribe({
      next:(res: MemberStatus[]) => {
        console.log(res);
        this.clientStatus = res;        
      },error:(err: erroResponseModel & {err: HttpErrorResponse}) => {
        const message = err.err.message ? err.err.message : 'Failed To Load Your Clients Info';
        console.log(`An Error Occured due to ${message}`);
        this.notify.showError(message)        
      }
    })
  }
  isActive(memberId: string) :boolean{
   return this.clientStatus.find(m=> m.memberId === memberId)?.active ?? false;
  }


 memberId : string = '';
addSessionPopup:boolean = false;

openAddSessionPopup(c: MemberResponseDto) {
  console.log('add session triggred');
  
  this.memberId = c.memberId;
  this.sessionForm.memberId = c.memberId;
  this.addSessionPopup = true;
}
closeAddSessionPopup() {
  this.addSessionPopup = false;
    // Reset form back to default empty values
  this.sessionForm = {
    sessionName: '',
    sessionDate: '',
    duration: 0.0,
    memberId: ''
  };

  // Reset selected member (optional but recommended)
  this.memberId = '';
}

sessionForm: AddSessionRequestDto = {
  sessionName: '',
  sessionDate : '',
  duration : 0.0,
  memberId : '',
};

isPastDate(value: string | Date): boolean {
  if (!value) return true;

  const selected = new Date(value);
  if (isNaN(selected.getTime())) return true;

  const now = new Date();
  return selected.getTime() < now.getTime();
}

isFormValid(): boolean {
  return (
    typeof this.sessionForm.sessionName === 'string' &&
    this.sessionForm.sessionName.trim().length > 0 &&

    typeof this.sessionForm.sessionDate === 'string' &&
    this.sessionForm.sessionDate.length > 0 &&
    !this.isPastDate(this.sessionForm.sessionDate) &&

    !isNaN(Number(this.sessionForm.duration)) &&
    Number(this.sessionForm.duration) >= 0.5 &&
    Number(this.sessionForm.duration) <= 2.5
  );
}

submitSession() {
  if (!this.isFormValid()) {
    this.notify.showError("Please enter valid inputs before submitting.");
    return;
  }
  console.log("Submitting session:", this.sessionForm);
  this.loader.show('Saving New Session',faSave);
  this.trainer.addNewSession(this.trainerId,this.sessionForm).subscribe({
    next:(res:GenericResponse) => {
      console.log(res);
      
      console.log(`fetched response from backend is ${res.message}`);
      this.trainer.getUpcomingSessions(this.trainerId,0,20);
      this.closeAddSessionPopup()
      this.loader.hide();
      this.notify.showSuccess(res.message);
    },error: (err: HttpErrorResponse) => { 
      this.loader.hide();
      
      // 1. Get the error body (which is your erroResponseModel)
      const errorBody: erroResponseModel | undefined = err.error;

      let messageToShow = 'Failed To add Session Due to unknown error';

      if (errorBody && errorBody.message) {
        // 2. Use the specific error message from the backend response body
        messageToShow = errorBody.message; 
        console.log("Backend Error Message:", messageToShow);
      } else {
        // Fallback for network errors or non-JSON responses
        messageToShow = err.message || messageToShow;
        console.error("Unknown error structure:", err);
      }

      this.notify.showError(messageToShow);
    },
  }) 
}
}
