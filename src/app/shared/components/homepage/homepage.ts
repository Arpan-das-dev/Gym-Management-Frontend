import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDumbbell, faChartLine, faUsers, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-homepage',
  imports: [Navbar, FontAwesomeModule, Footer],
  standalone:true,
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {
  icons  ={
    dumbell: faDumbbell,
    chart: faChartLine,
    users: faUsers,
    badge: faIdBadge
  };
  userIdentifier = localStorage.getItem('email') || localStorage.getItem('id');
  constructor(private router: Router,
    private authservice: Authservice,
  ){}
  getStarted() : void {
    if(this.authservice.isLoggedIn()){
      this.router.navigate(['/dashboard'],
        {queryParams: {'user': this.userIdentifier}});
    } else{
      this.router.navigate(['/login']);
    }
  }
  viewPlans() : void {
    this.router.navigate(['/plans']);
  }
}
