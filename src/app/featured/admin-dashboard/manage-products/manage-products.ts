import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-products',
  imports: [FontAwesomeModule],
  templateUrl: './manage-products.html',
  styleUrl: './manage-products.css',
})
export class ManageProducts {
icons = { products: faBox };
  loading = false;

  constructor(private router: Router) {}

  handleNavigation() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['manageProducts']);
    }, 1000); // Simulated loading delay
  }
}
