import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCogs, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../core/services/authservice';
import { NotifyService } from '../../core/services/notify-service';
import { LoadingService } from '../../core/services/loading-service';
import { Navbar } from "../../shared/components/navbar/navbar";
import { ProfileCard } from "./profile-card/profile-card";
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-trainer-dasboard',
  imports: [FontAwesomeModule, NgClass, Navbar, ProfileCard, Footer],
  templateUrl: './trainer-dasboard.html',
  styleUrl: './trainer-dasboard.css',
})
export class TrainerDasboard  implements OnInit{
// constructor 
constructor(private auth: Authservice, private notify: NotifyService, private loader: LoadingService){}
// onInit implement
ngOnInit(): void {
    this.notify.notification$.subscribe((data) => {
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
// global loading and notifications showing popoup variables
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
}
