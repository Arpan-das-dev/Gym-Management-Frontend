import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { signupModel } from '../../../core/Models/signupModel';
import { AdminService } from '../../../core/services/admin-service';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {
  successMessage: string = '';
  errorMessage: string = '';
  createUser: FormGroup;
  constructor(
    private authservice: Authservice,
    private router: Router,
    private formBuilder: FormBuilder,
    private adminService: AdminService
  ) {
    this.createUser = this.formBuilder.group({
      firstName: ['', Validators.required, Validators.minLength(4)],
      lastName: ['', Validators.required, Validators.minLength(4)],
      email: ['', Validators.required, Validators.email],
      phone: [
        '',
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(12),
        Validators.pattern('^[0-9]*$'),
      ],
      password: ['', Validators.required, Validators.minLength(6)],
      gender: ['', Validators.required],
      role: ['', Validators.required],
    });
    
  }
  onSubmit() {
    console.log('onsubmit() triggered');
    if(!this.createUser.invalid) {
      const data: signupModel = {
      firstName: this.createUser.get('firstName')?.value,
      lastName: this.createUser.get('lastName')?.value,
      email: this.createUser.get('email')?.value,
      phone: this.createUser.get('phone')?.value,
      password: this.createUser.get('password')?.value,
      gender: this.createUser.get('gender')?.value,
      role: this.roleMapper(this.createUser.get('role')?.value),
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    const role = data.role;
    if (role === 'TRAINER') {
      this.createTrainer(data);
      console.log(data);
      
    } else if (role == 'ADMIN') {
      this.createAdmin(data);
      console.log(data);
      
    } else {
      this.createMember(data);
      console.log(data);
      
    }
    } else{
      console.log(this.createUser.errors);
    }
  }
  roleMapper(role: string): string {
    const upperRole = role.toUpperCase();
    const currentUserRole = this.authservice.getUserRole();

    if (currentUserRole !== 'ADMIN') {
      if (upperRole === 'TRAINER') return 'TRAINER_PENDING';
      if (upperRole === 'MEMBER') return 'MEMBER';
    } else if (currentUserRole === 'ADMIN') {
      if (upperRole === 'TRAINER') return 'TRAINER';
      if (upperRole === 'MEMBER') return 'MEMBER';
      if (upperRole === 'ADMIN') return 'ADMIN';
    }
    return upperRole;
  }

  createTrainer(data: signupModel) {
    this.adminService.createTrainer(data).subscribe({
      next: (res) => {
        console.log(res);
        this.successMessage = res.message;
        this.createUser.reset()
      },
      error: (error) => {
        console.log(error);
        this.errorMessage = error;
      },
    });
  }

  createMember(data: signupModel) {
    this.adminService.createMember(data).subscribe({
      next: (res) => {
        console.log(res);
        this.successMessage = res.message;
        this.createUser.reset()
      },
      error: (error) => {
        console.log(error);
        this.errorMessage = error;
      },
    });
  }

  createAdmin(data: signupModel) {
    this.adminService.createAdmin(data).subscribe({
      next: (res) => {
        console.log(res);
        this.successMessage = res.message;
        this.createUser.reset()
      },
      error: (error) => {
        console.log(error);
        this.errorMessage = error;
      },
    });
  }
}
