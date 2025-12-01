import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { MemberService } from '../../../core/services/member-service';
import { NotifyService } from '../../../core/services/notify-service';
import { LoadingService } from '../../../core/services/loading-service';
import { faArrowDown, faArrowUp, faDownload, faDumbbell, faHeartbeat, faWeightScale } from '@fortawesome/free-solid-svg-icons';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-weight-bmi-info',
  imports: [NgClass, FontAwesomeModule],
  templateUrl: './weight-bmi-info.html',
  styleUrl: './weight-bmi-info.css',
})
export class WeightBmiInfo implements OnInit{

  // global icons for this component
  icons = {
  scale: faWeightScale,
  bmi: faHeartbeat,
  weight: faDumbbell,
  up: faArrowUp,
  down: faArrowDown,
};

userId = ''

constructor(private auth : Authservice, private member: MemberService, private notify: NotifyService, private loader: LoadingService) {}
ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.loadAllBmiWeightInfo()  
}

bmiWeightInfo: BmiWeightInfoResponseDto = {
  currentBmi : 0,
  currentBodyWeight : 0,
  changedBmiFromLastMonth : 0,
  changedBodyWeightFromLastMonth : 0,
  latestDate: '',
  oldDateTime : ''
}

  loadAllBmiWeightInfo() {
    this.loader.show("Fetching Weight Bmi Changes Information", faDownload);
    this.member.getMemberWeightBmiChange(this.userId).subscribe({
      next:(res:BmiWeightInfoResponseDto) => {
        this.bmiWeightInfo = res;
        console.log(res);
        this.loader.hide()
        this.notify.showSuccess("SuccessFully Loaded Bmi and Weight Changes")
      }, error:(error: erroResponseModel & {error: HttpErrorResponse}) => {
        console.log(error);
        const errorMessage = error?.error?.message ? error.error.message : 'Failed to save entry';
        this.loader.hide()
        this.notify.showError(errorMessage)
      }
    })
  }


  
}
export interface BmiWeightInfoResponseDto {
  currentBmi: number;
  changedBmiFromLastMonth: number;
  currentBodyWeight: number;
  changedBodyWeightFromLastMonth: number;
  latestDate: string;
  oldDateTime: string;
}
