import { Component, OnInit } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { Router} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../core/services/authservice';
import { TrainerService } from '../../core/services/trainer-service';
import { NgClass } from '@angular/common';
import {
  AllPublicTrainerInfoResponseWrapperDto,
  PublicTrainerInfoResponseDto,
} from '../../core/Models/TrainerServiceModels';
import { erroResponseModel } from '../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import {GenericResponse,} from '../../core/Models/genericResponseModels';
import { DataTransferService } from '../../core/services/data-transfer-service';

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
  // gloabal method to show full screen message with loading screen
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  constructor(private auth: Authservice, private trainer: TrainerService, private router: Router, private dataTransfer : DataTransferService) {}
  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadAllTrainers();
  }
  /**
   * this section is for the global loading and global showing message depending on sucess/error
   * with all icons (faCogs)
   */
  icons = {
    cogs: faCircle,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
  };

  Trainers: PublicTrainerInfoResponseDto[] = [];

  loadAllTrainers() {
    this.loading = true;
    this.trainer.getAllBasicInfo().subscribe({
      next: (res: AllPublicTrainerInfoResponseWrapperDto) => {
        console.log('Successfully fetched all trainers from db');
        console.log(res);
        this.Trainers = res.responseDtoList;
        res.responseDtoList.map((t) => {
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
  handleNavigation(trainer:PublicTrainerInfoResponseDto){
    const id = trainer.id;
    this.dataTransfer.setTrainerId(id);
    this.router.navigate(['/do it later'])
  }
}
/**
 * ngOnInit() {
    this.dataTransferService.currentTrainerId$
      .pipe(
        // Filter out the initial null value
        filter(id => id !== null),
        // Take only the first ID received, then complete the subscription
        take(1) 
      )
      .subscribe(trainerId => {
        // 🚨 Use the received ID to call your secure API endpoint
        console.log('Fetching reviews for hidden ID:', trainerId);
        this.reviewService.fetchReviews(trainerId).subscribe(reviews => {
          // ... process reviews
        });
        
        // Optional: Reset the ID to null after use
        this.dataTransferService.setTrainerId(null);
      });
  }
}
 */