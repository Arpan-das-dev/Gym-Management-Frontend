import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { first } from 'rxjs';
import { signupModel } from '../../../core/Models/signupModel';
import { RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import {
  faCheckCircle,
  faCogs,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FontAwesomeModule,NgClass],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {
  // global loading screen
  loading = false;
  showMessage = false;
  messageText = '';
  globalLoadinText = '';
  messageType: 'success' | 'error' = 'success';

  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
      this.icons.loading = faCogs;
    }, 3000);
  }
  icons = {
    loading: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
  };
  signupForm: FormGroup;
  constructor(
    private authservice: Authservice,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(4)]],
      lastName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['', [Validators.required]],
      role: ['', [Validators.required]],
    });
  }
  onSubmit() {
    console.log('🟢 onSubmit() triggered!');
    const data: signupModel = {
      firstName: this.signupForm.get('firstName')?.value,
      lastName: this.signupForm.get('lastName')?.value,
      email: this.signupForm.get('email')?.value,
      phone: this.signupForm.get('phone')?.value,
      password: this.signupForm.get('password')?.value,
      gender: this.signupForm.get('gender')?.value,
      role: this.roleMapper(this.signupForm.get('role')?.value),
      joinDate: new Date().toISOString().split('T')[0],
    };
    console.log(data);

    if (this.signupForm.valid) {
      this.loading = true;
      this.globalLoadinText = 'Signing up';
      this.authservice
        .signup(data)
        .pipe(first())
        .subscribe({
          next: (response) => {
            console.log('Signup successful', response);
            sessionStorage.setItem('emailForVerification', data.email);
            sessionStorage.setItem('phoneForVerification', data.phone);
            sessionStorage.setItem(
              'userName',
              data.firstName + ' ' + data.lastName
            );
            this.loading = false;
            this.showFullScreenMessage(
              'success',
              'SuccessFully Signed Up Redecting to Email Verification Page'
            );
            setTimeout(() => {
              this.router.navigate(['/verify-email']);
            }, 600);
          },
          error: (error: erroResponseModel & { error: HttpErrorResponse }) => {
            console.log(error);
            const errorMessage = error?.error?.message
              ? error.error.message
              : 'Failed to save entry';
            errorMessage.includes('/')
              ? this.showFullScreenMessage(
                  'error',
                  'Sign Up Failed Due to Internal Issue Contact Admin'
                )
              : this.showFullScreenMessage('error', errorMessage);
            console.error('Signup failed', error);
          },
        });
    } else {
      console.log('form is not valid');
    }
  }
  ngOnInit(): void {
    this.userRole();
  }

  userRole(): string {
    return this.authservice.getUserRole() || '';
  }

  roleMapper(role: string): string {
    const upperRole = role.toUpperCase();
    const currentUserRole = this.authservice.getUserRole();

    if (currentUserRole !== 'ADMIN') {
      if (upperRole === 'TRAINER') return 'TRAINER';
      if (upperRole === 'MEMBER') return 'MEMBER';
    }

    return upperRole;
  }
}
