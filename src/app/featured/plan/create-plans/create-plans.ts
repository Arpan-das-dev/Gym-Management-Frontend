import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanCreateRequestDto } from '../../../core/Models/planModel';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faClipboardList, faDumbbell, faExclamationCircle, faPlus, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-plans',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-plans.html',
  styleUrl: './create-plans.css',
})
export class CreatePlans {
  icons = {
    dumbell: faDumbbell,
    plus: faPlus,
    xmark: faXmark,
    clipBoardList: faClipboardList,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    warning: faWarning,
  }
  
  planForm: FormGroup;
  constructor(private router: Router, private adminService: AdminService, private fb: FormBuilder) {
    this.planForm = this.fb.group({
      planName: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      duration: [0, [Validators.required, Validators.min(1)]],
      features: this.fb.array([], Validators.required)
    });
  }
  get features(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  addFeature() {
    this.features.push(this.fb.control(''));
  }
  removeFeature(index: number) {
    this.features.removeAt(index);
  }
  onSumbit() {
    this.isSubmitted = true;
  this.successMessage = '';
  this.errorMessage = '';
console.log("onSubmitTriggered");

    if (this.planForm.valid) {
      this.loading = true;
      setTimeout(() => {
        this.createPlan();
      }, 2000);
    } else{
      this.planForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      console.log("form invalid");
      
      return;
    }
  }
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  isSubmitted: boolean = false
createPlan() {
  const cleanedFeatures = this.features?.value
    .filter((f: string) => f && f.trim().length > 0);

    let priceValue = this.planForm.value.price ? parseFloat(this.planForm.value.price).toFixed(2) : '0.00';
  console.log(this.planForm.value);
  const data: PlanCreateRequestDto = {
    planName: this.planForm.get('planName')?.value,
    price: priceValue,
    duration: this.planForm.get('duration')?.value,
    features: cleanedFeatures
  };

  console.log("============");
  
    this.adminService.createPlan(data).subscribe({
      next: (res) => {
        console.log(res);
        this.successMessage = 'Plan created successfully!';
        this.loading = false;
        this.planForm.reset();
        this.features.clear();
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = err.err?.message || 'Something went wrong. Please try again.';
        this.loading = false;
      }
    })
  }

  moveTodashBoard() {
    this.router.navigate(['/dashboard'])
  }
}
