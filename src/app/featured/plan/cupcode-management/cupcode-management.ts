import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTicket } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../../core/services/admin-service';
import { PlanService } from '../../../core/services/plan-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { plansResponseModel } from '../../../core/Models/planModel';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-cupcode-management',
  imports: [FontAwesomeModule, ReactiveFormsModule,CommonModule],
  templateUrl: './cupcode-management.html',
  styleUrl: './cupcode-management.css',
})
export class CupcodeManagement implements OnInit {
  icons={
    cupon: faTicket,
    plus: faPlus,
  }

  createCupon : FormGroup
  constructor(private router: Router, 
    private adminService: AdminService,
     private planService: PlanService,
    private builder: FormBuilder) {
    this.createCupon = this.builder.group({
      planId: ['',[Validators.required, Validators.minLength(6)]],
      cuponCode : ['',[Validators.required,Validators.minLength(4),Validators.maxLength(20),Validators.pattern('^[A-Z0-9_]+$')]],
      discount: [0.00, [Validators.required,Validators.min(0.1),Validators.max(100.00)]],
      validFrom:['', [Validators.required]],
      validTill: ['',[Validators.required]],
      access: ['',[Validators.required]],
      description: ['',[Validators.maxLength(500)]]
    })
  }
  ngOnInit(): void {
      this.loadAllPLans()
  }
  plans:plansResponseModel[] = [];
  loadAllPLans(){
    this.planService.getAllPlans().subscribe({
      next:(res) =>{
        console.log(res.responseDtoList);
        this.plans = res.responseDtoList;
      }
    })
  }

  onSubmit(){
    const plaId = this.createCupon.get('planId');
    console.log(plaId);
    
  }
}
