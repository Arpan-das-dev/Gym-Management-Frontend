import { Component, OnInit } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faCircle,
  faCogs,
  faComment,
  faEnvelope,
  faExclamationCircle,
  faFire,
  faGenderless,
  faMars,
  faStar,
  faUserPlus,
  faUsers,
  faVenus,
} from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../core/services/authservice';
import { TrainerService } from '../../core/services/trainer-service';
import { NgClass } from '@angular/common';
import {
  AllPublicTrainerInfoResponseWrapperDto,
  publicTrainerInfoResponseDtoList,
  TrainerAssignRequestDto,
} from '../../core/Models/TrainerServiceModels';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { GenericResponse } from '../../core/Models/genericResponseModels';
import { MemberService } from '../../core/services/member-service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-our-trainers',
  imports: [Navbar, Footer, FontAwesomeModule, NgClass],
  templateUrl: './our-trainers.html',
  styleUrl: './our-trainers.css',
})
export class OurTrainers implements OnInit {
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
  globalLoadinText  :string = 'loading'
  // gloabal method to show full screen message with loading screen
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private router: Router,
    private member :MemberService,
    private cookie : CookieService
  ) {}
  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadAllTrainers();
  }
  /**
   * this section is for the global loading and global showing message depending on sucess/error
   * with all icons (faCogs)
   */
  icons = {
    cogs: faCogs,
    users: faUsers,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    mail: faEnvelope,
    star: faStar,
    fire: faFire,
    comment: faComment,
    userPlus: faUserPlus,
  };

  Trainers: publicTrainerInfoResponseDtoList[] = [];

  loadAllTrainers() {
    this.loading = true;
    this.trainer.getAllBasicInfo().subscribe({
      next: (res: AllPublicTrainerInfoResponseWrapperDto) => {
        console.log('Successfully fetched all trainers from db');
        console.log(res);
        this.Trainers = res.publicTrainerInfoResponseDtoList;
        res.publicTrainerInfoResponseDtoList.map((t) => {
          t.showAll = false;
          this.trainer.getProfileImageByTrainerId(t.id).subscribe({
            next: (res: GenericResponse) => {
              console.log(res.message);
              t.profileImageUrl = res.message;
            },
            error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
              console.log('Error Occured ::=>');
              console.log(
                `${err.status} and error caused due to ${err.message}`
              );
            },
          });
        });
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'SuccessFully Loaded All Trainers'
        );
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(`${err.status} and error caused due to ${err.message}`);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load All Trainers Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }
  handleNavigation(trainer: publicTrainerInfoResponseDtoList) {
    const id = trainer.id;
    const trainerName = `${trainer.firstName} ${trainer.lastName}`
    console.log(`current trainer's id is --> ${id}`);
    this.cookie.set('reviewTrainerId',id,{path:'/',sameSite:'Strict'})
    this.router.navigate(['/viewReviews'],{queryParams:{trainer:trainerName}});
  }

  genderThemeMapper(gender: string): any[] {
    const gend = gender.toLowerCase();
    let genderIcon = faGenderless;
    let genderValue: string = '';
    let genderImage: string = '';
    switch (gend) {
      case 'female':
        genderValue = 'text-xl text-rose-600';
        genderIcon = faVenus;
        genderImage = 'defaultFemale.png';
        break;
      case 'male':
        genderValue = 'text-xl text-blue-600';
        genderIcon = faMars;
        genderImage = 'defaultMale.png';
        break;
      default:
        genderValue = 'text-xl text-gray-600';
        genderImage = 'defaultProfile.png';
    }
    return [genderValue, genderIcon, genderImage];
  }
requestAsCoach(trainer: publicTrainerInfoResponseDtoList) {
  this.loading = true;

  if (!this.auth.isLoggedIn()) {
    this.loading = false;
    return this.showFullScreenMessage('error', 'You are not logged in. Please login.');
  }

  if (!this.auth.isEmailVerified()) {
    this.loading = false;
    return this.showFullScreenMessage('error', 'Your email is not verified.');
  }

  if (!this.auth.isPhoneVerifed()) {
    this.loading = false;
    return this.showFullScreenMessage('error', 'Your phone number is not verified.');
  }

  const memberId = this.auth.getUserId(); 

  if (this.member.hasAccess(memberId) && this.member.hasValidPlan(memberId)) {
    this.loading = false;
    return this.handleMemberRequest(trainer, memberId);  
  }

  this.loading = false;
  this.showFullScreenMessage('error', 'You do not have a valid plan or access.');
}
  
  handleMemberRequest(trainer: publicTrainerInfoResponseDtoList,memberId:string) {
    console.log("handing request triggered");
    this.loading = true
    this.globalLoadinText = 'Sending Request to Admin'
    const assignData : TrainerAssignRequestDto = {
      memberId: memberId,
      requestDate : new Date().toISOString(),
      trainerId : trainer.id,
      trainerName : `${trainer.firstName} ${trainer.lastName}`,
      trainerProfileImageUrl : trainer.profileImageUrl
    }
    this.member.requestToGetCoach(assignData).subscribe({
      next:(res:GenericResponse) => {
        console.log(`get the response from backend is ${res.message}`);
        this.loading = false;
        this.showFullScreenMessage('success',res.message)        
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Request Admin Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      }
    })
  }
}

