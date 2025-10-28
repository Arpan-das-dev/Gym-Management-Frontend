import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authservice } from '../../../core/services/authservice';
import { loginModel } from '../../../core/Models/loginModels';

@Component({
  selector: 'app-login',
  imports: [FormsModule,ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm: FormGroup;

  identifier: string = '';
  password: string = '';

  data: loginModel = {
    identifier: this.identifier,
    password: this.password,
  };

  validated: boolean = false;
  constructor(private authservice: Authservice, private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      identifier: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  onSubmit() {
    if(this.loginForm.valid){
       this.authservice.login(this.data).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.validated = true;
        alert('Login failed. Please check your credentials and try again.');
      },
    });
    }
  }
}
