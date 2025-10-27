import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { first } from 'rxjs';
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  signupForm: FormGroup;
  constructor(private authservice: Authservice,
     private router: Router,
      private formBuilder: FormBuilder) {
    this.signupForm = this.formBuilder.group({
      firstName:['', [Validators.required, Validators.minLength(4)]],
      lastName:['', [Validators.required, Validators.minLength(4)]],
      email:['', [Validators.required, Validators.email]],
      phone:['', [Validators.required, Validators.minLength(10), Validators.maxLength(10),Validators.pattern('^[0-9]*$')]],
      password:['', [Validators.required, Validators.minLength(6)]],
      gender:['', [Validators.required]],
      role:['', [Validators.required]],
    });
  }
  const data: signupModel = {
      firstName: this.signupForm.get('firstName')?.value,
      lastName: this.signupForm.get('lastName')?.value,
      email: this.signupForm.get('email')?.value,
      phone: this.signupForm.get('phone')?.value,
      password: this.signupForm.get('password')?.value,
      gender: this.signupForm.get('gender')?.value,
      role: this.signupForm.get('role')?.value,
      joinDate: new Date()
    };
    bySubmit() {
      if(this.signupForm.valid){
         this.authservice.signup(this.data).pipe(first()).subscribe({
           next: (response) => {
             console.log('Signup successful', response);
             this.router.navigate(['/login']);
           },
           error: (error) => {
             console.error('Signup failed', error);
           }
         });
      }
    }
  }