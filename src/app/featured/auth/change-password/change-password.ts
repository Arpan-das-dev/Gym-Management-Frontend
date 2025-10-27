import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword implements OnInit {
  email: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;

  constructor(private activatedRoute : ActivatedRoute, private router : Router, private authservice : Authservice) {}
  ngOnInit(): void {
    this.email = this.activatedRoute.snapshot.queryParamMap.get('email') || '';
  }

  changePassword() {
    if(this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authservice.changePassword(this.email || '', this.newPassword).subscribe({
      next: (response) => {
        this.loading = false; 
        this.successMessage = response || 'Password changed successfully!';
        this.errorMessage = '';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error || 'Failed to change password.';
      }
    });
  }
}