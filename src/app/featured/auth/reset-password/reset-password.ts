import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../../core/services/authservice';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;

  constructor(private authService: Authservice,
    private activatedRoute: ActivatedRoute,
    private router : Router
  ) { }
  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }
    // start loading
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call the auth service to reset the password
    this.authService.changePassword(this.email || '', this.newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response || 'Password reset successfully. You can now log in with your new password.';
        this.errorMessage = '';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error || 'Failed to reset password. Please try again.';
        this.successMessage = '';
        console.error(error);
      },
    });
  }
  ngOnInit(): void {
      this.email = this.activatedRoute.snapshot.queryParamMap.get('email') || '';
  }
}
