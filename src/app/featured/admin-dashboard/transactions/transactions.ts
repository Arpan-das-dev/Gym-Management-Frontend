import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoneyCheckAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transactions',
  imports: [FontAwesomeModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  icons = { transactions: faMoneyCheckAlt };
  loading = false;

  constructor(private router: Router) {}

  handleNavigation() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['recentTransactions']);
    }, 1000); // Simulated loading delay
  }

}
