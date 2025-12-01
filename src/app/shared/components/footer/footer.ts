import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faEnvelope, faInfoCircle, faPhone, faQuestionCircle, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { RouterLink } from "@angular/router";
@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
icons = {
  linkedin: faLinkedin,
  briefcase: faGithub,
  info: faInfoCircle,
  mail: faEnvelope,
  phone: faPhone,
  help: faQuestionCircle,
  trainer: faUserTie 
};

}
