import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faCogs, faHome, faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-product-managements',
  imports: [FontAwesomeModule],
  templateUrl: './product-managements.html',
  styleUrl: './product-managements.css',
})
export class ProductManagements {
icons = {
  cogs: faCogs,
  sparkles: faStar,
  home: faHome,
  arrowRight: faArrowRight
};

constructor(private router: Router){}
returnHome() {
  this.router.navigate(['home'])
}
explorePlans() {
  this.router.navigate(['plans'])
}
}
