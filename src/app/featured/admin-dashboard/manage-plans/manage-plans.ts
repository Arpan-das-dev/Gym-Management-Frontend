import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClipboardList, faCogs, faFileAlt, faSlidersH, faTasks } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-plans',
  imports: [FontAwesomeModule],
  templateUrl: './manage-plans.html',
  styleUrl: './manage-plans.css',
})
export class ManagePlans {
  icons = {
    managePlans: faCogs,
  }
  loading = false
  constructor(private router : Router){}
  handleNavigation() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['managePlans']);
    }, 1000); // Fake loading for 1 second
  }
}
