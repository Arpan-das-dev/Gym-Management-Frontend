import { Component, OnInit } from '@angular/core';
import { ProfileCard } from "./profile-card/profile-card";
import { Navbar } from "../../shared/components/navbar/navbar";
import { FitDetails } from "./fit-details/fit-details";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgClass } from '@angular/common';
import { faCheckCircle, faCogs, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { NotifyService } from '../../core/services/notify-service';
import { LoadingService } from '../../core/services/loading-service';
import { Footer } from "../../shared/components/footer/footer";
import { PrDetails } from "./pr-details/pr-details";
import { WeightBmiInfo } from "./weight-bmi-info/weight-bmi-info";

@Component({
  selector: 'app-member-dasboard',
  imports: [ProfileCard, Navbar, FitDetails, FontAwesomeModule, NgClass, Footer, PrDetails, WeightBmiInfo],
  templateUrl: './member-dasboard.html',
  styleUrl: './member-dasboard.css',
})
export class MemberDasboard implements OnInit {
  icons = {
    loading: faCogs,
    exclamationCircle: faExclamationCircle,
    checkCircle: faCheckCircle,
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
      this.icons.loading = faCogs;
    }, 3000);
  }

  constructor(private notification : NotifyService, private loader : LoadingService) {}
  ngOnInit() {
  this.notification.notification$.subscribe((data) => {
    if (data) {
      this.messageType = data.type;
      this.messageText = data.message;
      this.showMessage = true;

      setTimeout(() => {
        this.showMessage = false;
      }, 4000);
    }
  });

  this.loader.loading$.subscribe(state => {
    if(state) {
    this.globalLoadinText = state?.message 
    this.loading = state?.show
    this.icons.loading = state.icon
    }
    this.icons.loading = faCogs;
  })
}

}
