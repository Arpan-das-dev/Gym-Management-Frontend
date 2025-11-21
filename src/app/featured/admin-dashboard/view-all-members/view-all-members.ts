import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { CommonModule, DatePipe, NgClass, NgStyle } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp, faBars, faCheckCircle,faCogs,faEnvelope,faExclamationCircle,faEye,faLock,faLockOpen,faPhone,faSearch,faSnowflake,faSyncAlt,faTrash,} from '@fortawesome/free-solid-svg-icons';
import { MemberService } from '../../../core/services/member-service';
import { Subscription } from 'rxjs';
import { AllMemberListResponseDto, AllMembersInfoWrapperResponseDtoList } from '../../../core/Models/MemberServiceModels';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { Navbar } from "../../../shared/components/navbar/navbar";
import { Footer } from "../../../shared/components/footer/footer";

@Component({
  selector: 'app-view-all-members',
  imports: [NgClass, FormsModule, FontAwesomeModule, DatePipe, ReactiveFormsModule, CommonModule, Navbar, Footer],
  templateUrl: './view-all-members.html',
  styleUrl: './view-all-members.css',
})
export class ViewAllMembers implements OnInit {
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  // ui popup vlaues
dropdownOpen: string | null = null;
expandedMember: string | null = null;
mailPopupOpen = false;
selectedMember!: AllMemberListResponseDto;
mailSubject = '';
mailMessage = '';
defaultFeamaleAvatar = 'defaultFemale.png';
defaultMaleAvatar = 'defaultMale.png';
sortDirection: 'asc' | 'desc' = 'desc';

  // global message showing methods
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
  private subs = new Subscription();
  constructor(private admin: AdminService, private member : MemberService) {}
  // icons object for fontawesome icons
  icons = {
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    syncAlt: faSyncAlt,
    phone: faPhone,
    eye: faEye,
    envelope: faEnvelope,
    snowflake: faSnowflake,
    trash: faTrash,
    lockOpen: faLockOpen,
    lock : faLock,
    menu :  faBars,
    mail : faEnvelope,
    arrowUp: faArrowUp,
    arrowDown: faArrowDown,
    search : faSearch
  };
  // paging and data
  pageNo = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 1;
  isLastPage: boolean = false;
  // members data
  members: AllMemberListResponseDto[] = [];
  ngOnInit(): void {
    this.loadAllMembers();
  }


searchText = '';
searchType = 'name';      // 'name' | 'userId' | 'planName'
gender = '';              // '' | 'MALE' | 'FEMALE' | 'OTHER'
status = '';              // '' | 'ACTIVE' | 'FROZEN'
sortOption = 'planExpiration'; // 'planExpiration' | 'planDurationLeft' | 'lastLogin'
 toggleDropdown(id: string) {
  this.dropdownOpen = this.dropdownOpen === id ? null : id;
}

// toggle expanded details
toggleViewDetails(id: string) {
  this.expandedMember = this.expandedMember === id ? null : id;
  this.dropdownOpen = null;
}

// open mail popup
openMailPopup(m: AllMemberListResponseDto) {
  this.selectedMember = m;
  this.mailSubject = '';
  this.mailMessage = '';
  this.mailPopupOpen = true;
  this.dropdownOpen = null;
}

closeMailPopup() {
  this.mailPopupOpen = false;
}
  // load all members with current filters and paging which is the key method of the whole component
  loadAllMembers() {
  this.loading = true;

  const searchBy = (this.searchText || '').trim();
  // support searchType: name, userId, planName => pass searchBy directly,
  // backend repository already searches name/plan/id; if you want specific fields, backend must support it.
  const gender = (this.gender || '').trim();
  const status = (this.status || '').trim();
  const sortBy = (this.sortOption || 'planExpiration').trim();

  // note: your member.getAllMembers expects: (searchBy, gender, status, sortBy, sortDirection, pageNo, pageSize)
  this.member.getAllMembers(searchBy, gender, status, sortBy, this.sortDirection, this.pageNo, this.pageSize).subscribe({
    next: (res: AllMembersInfoWrapperResponseDtoList) => {
      this.members = res.responseDtoList || [];
      this.pageNo = res.pageNo ?? 0;
      this.pageSize = res.pageSize ?? this.pageSize;
      this.totalElements = res.totalElements ?? 0;
      this.isLastPage = res.lastPage ?? false;
      this.members.forEach(member =>{
        if(member.profileImageUrl === null || member.profileImageUrl.trim() === '' || !member.profileImageUrl.includes('http')){
          if(member.gender.toLocaleLowerCase() === 'female'){
            member.profileImageUrl = this.defaultFeamaleAvatar;
          } else {
            member.profileImageUrl = this.defaultMaleAvatar;
          }
        } 
      })
      this.loading = false;
    },
    error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
      console.error('Error loading members:', error);
      this.loading = false;
      const errorMessage = error?.error?.message ? error.error.message : 'Failed to load members.';
      this.showFullScreenMessage('error', errorMessage);
    }
  });
}

  
  // pagination actions
  next() {
    if (!this.isLastPage) {
      this.pageNo++;
      console.log(this.pageNo);
      console.log("next page loading");
      this.loadAllMembers();
    }
    else{
      console.log("last page reached");
    }
  }

  prev() {
    if (this.pageNo > 0) {
      this.pageNo--;
      this.loadAllMembers();
    }
  }

  reload() {
    this.pageNo = 0;
  }

  deleteMember(memberId:string){
    this.loading = true;
    this.member.deleteMember(memberId).subscribe({
      next:(res:genericResponseMessage) => {
        console.log(res);
        this.loading = false;
        const message = res.message ? res.message : 'Member deleted successfully.';
        this.showFullScreenMessage('success', message);
        this.loadAllMembers(); // refresh the member list
      }, error:(error: HttpErrorResponse & { error: erroResponseModel }) => {
        console.error('Error deleting member:', error);
        this.loading = false;
        const errorMessage = error.error && error.error.message ? error.error.message : 'Failed to delete member.';
        this.showFullScreenMessage('error', errorMessage);
      }
    })
  }

  applyFilters() {
  this.pageNo = 0;
  this.loadAllMembers();
}

onSearch() {
  this.pageNo = 0;
  this.loadAllMembers();
}
  sendMail(){
    if(!this.mailSubject.trim() || !this.mailMessage.trim()){
      this.showFullScreenMessage('error', 'Subject and message cannot be empty.');
      return;
    }
    }
    toggleFreeze(m: AllMemberListResponseDto){
      this.loading = true;
      this.member.freezeMember(m.id,!m.frozen).subscribe({
        next:(res:genericResponseMessage) => {
          console.log(res);
          this.loading = false;
          const action = m.frozen ? 'unfrozen' : 'frozen';
          const message = res.message ? res.message : `Member successfully ${action}.`;
          this.showFullScreenMessage('success', message);
          this.loadAllMembers(); // refresh the member list
        }, error:(error : erroResponseModel ) => {
          console.log("here goes the error");
          console.error('Error freezing/unfreezing member:', error);
          console.log("error ends here");
          this.loading = false;
          const errorMessage = error.message ? error.message : 'Failed to change member freeze status.';
          this.showFullScreenMessage('error', errorMessage);
        }
      })
    }
    
    toggleSortDirection(){
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.applyFilters();
    }

    
}
