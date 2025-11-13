import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-cupon-code',
  imports: [FontAwesomeModule],
  templateUrl: './manage-cupon-code.html',
  styleUrl: './manage-cupon-code.css',
})
export class ManageCuponCode {
icons = {
    managePlans: faList,
  }
  loading = false
  constructor(private router : Router){}
  handleNavigation() {
    console.log("__________________");
    
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['manageCuponCodes']);
    }, 1000); // Fake loading for 1 second
  }
}
