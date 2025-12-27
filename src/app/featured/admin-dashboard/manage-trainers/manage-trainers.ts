import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDumbbell} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-trainers',
  imports: [FontAwesomeModule],
  templateUrl: './manage-trainers.html',
  styleUrl: './manage-trainers.css',
})
export class ManageTrainers {
  icons = {
    reports : faDumbbell
  }
  loading = false
  loadingText = ""
  constructor(private router : Router){}
  handleNavigation() {
    this.loading = true;
    this.loadingText = "Fetching All Trainers"
    setTimeout(() => {
      this.loadingText = "Navigating to All Trainers Page"
      this.router.navigate(['manageTrainers'])
    },2000)
  }
}
