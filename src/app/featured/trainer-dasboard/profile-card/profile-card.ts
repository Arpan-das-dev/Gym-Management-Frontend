import { NgClass, NgStyle } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCamera,
  faClose,
  faCog,
  faCogs,
  faDownload,
  faDumbbell,
  faEdit,
  faEnvelope,
  faGenderless,
  faIdBadge,
  faMars,
  faPhone,
  faPlus,
  faRecycle,
  faSave,
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
import { SpecialityResponseDto, TrainerResponseDto } from '../../../core/Models/TrainerServiceModels';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { WebSocketService } from '../../../core/services/web-socket-service';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import {
  GenericResponse,
  genericResponseMessage,
} from '../../../core/Models/genericResponseModels';
import { FormsModule } from '@angular/forms';
import { SerarchPipePipe } from '../../../shared/pipes/serarch-pipe-pipe';
import { ActiveCountService } from '../../../core/services/active-count-service';

@Component({
  selector: 'app-profile-cardT',
  imports: [FontAwesomeModule, FormsModule,NgStyle,SerarchPipePipe,NgClass],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard implements OnInit, OnDestroy{
  // user id (trainer id ) which is responsible to do operations for the rest of the class
  trainerId = '';
  // constructor
  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private notify: NotifyService,
    private loader: LoadingService,
    private websocket: WebSocketService,
    private activeCountService : ActiveCountService
  ) {}
  // implent ngOnInit to load required things when page loads
  ngOnInit(): void {
    this.getAllPreDefinedSpecialites()
    this.trainerId = this.auth.getUserId();
    setTimeout(() => {
      this.loadTrainerInfo();
    }, 500);
    // console.log('role class is ==> ', this.roleClass);
    this.loadLiveUsersCount()
    console.log(this.loadLiveUsersCount());
    
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
    edit: faEdit,
    close : faClose,
    replace : faRecycle,
    plus: faPlus
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
    // console.log('upload triggered');

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadImage(file);
  }
  uploadImage(file: File) {
    this.loader.show('Uploading Image..', faUpload);
    this.trainer.uploadNewProfileImage(this.trainerId, file).subscribe({
      next: (res: genericResponseMessage) => {
        // console.log('uploaded image successfully');
        // console.log(res);
        this.profileImageMapper(res.message || '', this.trainerDetail.gender);
        this.loader.hide();
        this.notify.showSuccess('Image Uploaded SuccessFully');
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to Upload Image Due to Aws Service Issue';
        // console.log(error);
        this.loader.hide();
        this.notify.showError(errorMessage);
      },
    });
  }
  getProfileImage() {
    this.loader.show('Fetching Profile Image', faDownload);
    this.trainer.getProfileImageByTrainerId(this.trainerId).subscribe({
      next: (res: GenericResponse) => {
        // console.log(res);
        this.profileImageMapper(res.message, this.trainerDetail.gender);
        this.loader.hide();
        this.notify.showSuccess('Successfully Fetched Your Profile Image');
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to Load Profile Image Due to Internal Issue';
        // console.log('failed to load due to>>');
        // console.log(error);
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
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to Delete Your Image';
        // console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
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
        // console.log("current gender is ",gender);
        
        break;
      case 'male':
        this.roleClass = 'text-xl text-blue-600';
        this.genderIcon = faMars;
        // console.log("current gender is ",gender);
        
        break;
      default:
        this.roleClass = 'text-xl text-gray-600';
        this.genderIcon = faGenderless;
        // console.log("current gender is ",gender);
        
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
      next: (res: TrainerResponseDto ) => {
        // console.log('fetched from backend ::=>');
        // console.log(res);
        this.trainerDetail = res;
        if (res.gender.toLowerCase() === 'female') {
          this.genderIcon = faVenus;
        } else {
          this.genderIcon = faMars;
        }
        this.genderMapper(res.gender)
        this.getAboutForTrainer(res.trainerId)
        this.loadTrainerSpecialityById()
        this.loader.hide();
        this.notify.showSuccess('SuccessFully Loaded Your account Details');
        this.getProfileImage();
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message;
        // console.log(errorMessage);
        this.loader.hide();
        this.catchError(errorMessage,'Failed To Load Users Info')
      },
    });
  }

  /**
   * other's info of trainer's profile 
   * eg: trainers about and trainer's specialites 
   * and all the variables and methods are written below
   */
  aboutTrainer:string = ''
  aboutPopup:boolean = false // this variable is responsible to show popup box
  aboutCharCount:number = 0;
  updateCharCount(){
    this.aboutCharCount = this.aboutTrainer.length
  }
  /**
   * this makes the reverse of the above variable
   * {@link aboutPopup}
   */
  openAboutPopup(){
    this.aboutPopup = true;
    // console.log("about popupTriggered");
    
  }
  /**
   * this method does just reverse of {@link openAboutPopup}
   * so the popup is hidden
   */
  closeAboutPopup() {
    this.aboutPopup = false;
  }
  saveAboutInfo() {
    this.loader.show("Saving Your Update",faSave)
    this.trainer.setTrainerAbout(this.trainerId,this.aboutTrainer).subscribe({
      next:(res:GenericResponse) => {
        // console.log("Fetched response from backend ==> \n",res.message);
        this.aboutTrainer = res.message;
        this.loader.hide()
        this.closeAboutPopup()
        this.notify.showSuccess("Successfully Updated Your About")        
      },
      error:(err:erroResponseModel & {err:HttpErrorResponse}) => {
        const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.loader.hide()
        this.catchError(errorMessage,"Failed To Update About Please Try Again Later")        
      }
    })
  }
  getAboutForTrainer(trainerId:string) {

    this.trainer.getTrainerAbout(trainerId).subscribe({
      next:(res:GenericResponse) => {
        this.aboutTrainer = res.message;
        // console.log(res);
      },
      error:(err:erroResponseModel & {err:HttpErrorResponse}) => {
        const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Update About Please Try Again Later")        
      }
    })
  }
  updateAboutForTrainer() {
    this.saveAboutInfo()
  }

  /**
   * below methods are for manage specialies
   * and all the variables are related to it
   * 
   */
  // get specialites from backend 
  specialities:string[] = []
  trainerSpecialities : string [] = []
  searchText :string = ''
  // this method is to retreive all specialites defined in the backend
  getAllPreDefinedSpecialites() {
    this.trainer.getAllPreDefinedSpecialites().subscribe({
    next:(res:SpecialityResponseDto) => {
      // console.log("number of speciality fetched from backend is::=>",res.specialityList.length);
      this.specialities = res.specialityList.map(item=> item.replace("_"," "));
    }, error:(err: erroResponseModel & {err:HttpErrorResponse}) => {
      const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Load All PreDefined Specialites")
    }
    })
  }
  // this.method is to load all speciality for any specific trainer
  loadTrainerSpecialityById() {
    this.loader.show("Loading Your Specialities",faDownload)
    this.trainer.getSpecialityByTrainerId(this.trainerId).subscribe({
      next:(res:SpecialityResponseDto) => {
        // console.log("fetched trainer's speciality of ",res.specialityList.length+" no");
        // console.log(res);
        this.trainerSpecialities = res.specialityList;
        this.loader.hide();
        this.notify.showSuccess('Successfully Loaded All Specialites')        
      }, error:(err: erroResponseModel & {err:HttpErrorResponse}) => {
      const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Load All PreDefined Specialites")
    }
    })
  }
  newSpeciality: string = ''
  addSpecialityPopup:boolean = false;
  openAddSpecialityPopup(){
    this.addSpecialityPopup = true // this makes the popup visible so that trainers can update or delete speciality
  }
  closeAddSpecialityPopup(){
    this.addSpecialityPopup = false; // makes to close the popup
    this.newSpeciality = ''
        this.searchText = ''
  }
  selectSpeciality(sp:string) {
    this.newSpeciality = sp;
    this.searchText = sp;
  }
  // this method is to save a new speciality for a trainer
  saveSpeciality(){
    this.loader.show('Updating New Speciality In Your Profile',faSave);
    
    this.trainer.addNewSpecialityByTrainerId(this.trainerId,this.newSpeciality).subscribe({
      next:(res:SpecialityResponseDto) => {
        this.newSpeciality = ''
        this.searchText = ''
        // console.log("fetched trainer's speciality of ",res.specialityList.length+" no");
        // console.log(res);
        this.trainerSpecialities = res.specialityList;
        this.closeAddSpecialityPopup()
        this.loader.hide();
        this.notify.showSuccess('Successfully Updated Your Specialites')        
      },error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to Add Speciality';
        // console.log(error);
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
    })
  }
 // this method is to remove speciality for trainer
 confirmRemoveSpeciality(sp:string){
  this.loader.show("Deleting Speciality From Your Profile", faTrash)
  this.trainer.deleteSpecialityByTrainerId(this.trainerId,sp).subscribe({
    next:(res: GenericResponse) => {
      // console.log(res.message);
      this.loadTrainerSpecialityById();
      this.loader.hide()
      this.notify.showSuccess(res.message);      
    }, error:(err: erroResponseModel & {err:HttpErrorResponse}) => {
      const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Load All PreDefined Specialites")
    }
  })
 }

 /**
  * here all varables and methods are to update speciality
  */
 oldSpeciality = ''
 newReplaceableSpeciality = ''
 updateSpecialityCondition: boolean = false;
 updateSpeciality(sp:string) {
  this.oldSpeciality = sp
  this.updateSpecialityCondition = true;
 }

 updateSpecialites() {
  this.loader.show('Replacing Your Speciality',faRecycle)
  this.trainer.replaceSpeciality(this.oldSpeciality,this.newReplaceableSpeciality,this.trainerId).subscribe({
    next:(res:SpecialityResponseDto) => {
      // console.log("fetched trainer's speciality of ",res.specialityList.length+" no");
        // console.log(res);
        this.trainerSpecialities = res.specialityList;
        this.loader.hide();
        this.notify.showSuccess('Successfully Updated Your Specialites')        
      }, error:(err: erroResponseModel & {err:HttpErrorResponse}) => {
      const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Update Your Speciality Specialites")
    }
  })
 }

 trainerStatus:string = "AVAILABLE"
  catchError(error: string | (erroResponseModel & {error: HttpErrorResponse}), defaultMessage: string) {
    const errorMessage = typeof error === 'string' ? error : error?.error?.message;
    if(errorMessage && !errorMessage.includes("/")) {
      this.notify.showError(errorMessage)
    } else {
      this.notify.showError(defaultMessage);
    }
  }
  updateStaus(){
    // console.log("update status triggered");
    this.loader.show("Updating Staus",faCog)
    this.trainer.setStatus(this.trainerId,this.trainerStatus).subscribe({
      next:(res:GenericResponse) => {
        // console.log(`fecthed result from backend as ${res.message}`);
        this.trainerStatus = res.message;
        this.loader.hide()
      }, error:(err: erroResponseModel & {err:HttpErrorResponse}) => {
      const errorMessage = err?.err?.message;
        // console.log(errorMessage);
        this.catchError(errorMessage,"Failed To Update Your Status")
    }
    })    
  }
  liveMemberCount = 0;
  liveAdminCount = 0;
  liveTrainerCount = 0;

loadLiveUsersCount() {

  // TRAINERS
  this.websocket.connect(
    'trainer',
    'ws://localhost:8080/ws/trainers'
  );
  this.websocket.subscribe(
    'trainer',
    '/topic/activeTrainers',
    count => {
      this.liveTrainerCount = count;
      console.log('👟 Trainers:', count);
    }
  );

  // MEMBERS
  this.websocket.connect(
    'member',
    'ws://localhost:8080/ws/member'
  );
  this.websocket.subscribe(
    'member',
    '/topic/activeMembers',
    count => {
      this.liveMemberCount = count;
      console.log('🧍 Members:', count);
    }
  );

  // ADMINS
  this.websocket.connect(
    'admin',
    'ws://localhost:8080/ws/admins'
  );
  this.websocket.subscribe(
    'admin',
    '/topic/activeAdmins',
    count => {
      this.liveAdminCount = count;
      console.log('🧑‍💼 Admins:', count);
    }
  );
  this.loadCountServiceCount()
}

  loadCountServiceCount() {
  this.activeCountService.getAllCount$().subscribe({
    next: ([admin, trainer, member]) => {
      this.liveAdminCount = admin;
      this.liveTrainerCount = trainer;
      this.liveMemberCount = member;

      console.log(
        `admin=${admin}, trainer=${trainer}, member=${member}`
      );
    }
  });
}
ngOnDestroy(): void {
  this.websocket.disconnectAll()
}

}
