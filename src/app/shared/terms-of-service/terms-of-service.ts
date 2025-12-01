import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faFileAlt, } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-terms-of-service',
  imports: [FontAwesomeModule,RouterLink],
  templateUrl: './terms-of-service.html',
  styleUrl: './terms-of-service.css',
})
export class TermsOfService {
  icons = {
    arrowLeft: faArrowLeft,
    file: faFileAlt
  };

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
