import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin-service';
import { Authservice } from '../../core/services/authservice';
import { userDetailModel } from '../../core/Models/signupModel';
import { Navbar } from "../../shared/components/navbar/navbar";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBoxesPacking, faCamera, faClipboardList, faDumbbell, faTrash, faUser, faUserPlus, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { NgClass, NgStyle } from '@angular/common';
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-admin-dashboard',
  imports: [Navbar, FontAwesomeModule, NgStyle, Footer,NgClass],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  icons = {
    member : faUser,
    trainer : faDumbbell,
    admined : faUserShield,
    camera : faCamera,
    trash: faTrash,
    createMember: faUserPlus,
    plan: faClipboardList,
    product: faBoxesPacking
  }
  trainerRequests = [
    {
      id: 1,
      name: 'Rohan Sharma',
      experience: '3 years',
      image: 'assets/images/trainer1.jpg',
      active: true,
    },
    {
      id: 2,
      name: 'Sneha Patel',
      experience: '5 years',
      image: 'assets/images/trainer2.jpg',
      active: false,
    },
    {
      id: 3,
      name: 'Arjun Mehta',
      experience: '2 years',
      image: 'assets/images/trainer3.jpg',
      active: true,
    },
  ];

  assignmentRequests = [
    {
      id: 1,
      member: 'Priya Das',
      trainer: 'Rohan Sharma',
      image: 'assets/images/member1.jpg',
      active: true,
    },
    {
      id: 2,
      member: 'Aman Verma',
      trainer: 'Sneha Patel',
      image: 'assets/images/member2.jpg',
      active: false,
    },
    {
      id: 3,
      member: 'Ritu Sen',
      trainer: 'Arjun Mehta',
      image: 'assets/images/member3.jpg',
      active: true,
    },
  ];
  constructor(private router: Router, private adminservice: AdminService, private authservice: Authservice) { }
  admin: userDetailModel = {
    id: "",
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    role: "",          // You can make this more specific if RoleType enums/values are known
    joinDate: "",     // LocalDate maps to string in ISO format (e.g. yyyy-MM-dd)
    emailVerified: false,
    phoneVerified: false,
    isApproved: false
  }
  ngOnInit(): void {
   this.loadUserInfo()
  }
  loadUserInfo(){
     const identifer = localStorage.getItem('identifer');
    if (identifer !== null) {
      console.log("sending request");
      console.log(identifer);
      this.authservice.loadUserInfo(identifer).subscribe({
        next: (res) => {
          this.admin = res;
          console.log("Admin::=>",this.admin);
          
        }
      })
    }
    console.log("nothing found");
  }
  totalUsers = 123
  userGrowth = 2
  viewAllUsers(){}
  totalRevenue = 46;
  revenueGrowth = 10;
  viewRevenueDetails(){}
  activeSubscriptions = 23
  subscriptionGrowth = 2
  totalOrders = 234
  orderGrowth = 2
  viewOrders(){}
  createUser() {
    this.router.navigate(['/createUser'])
  }

  createPlan() {
    this.router.navigate(['createPlan'])
  }

  createProduct() {
    console.log('Navigating to create product page...');
  }

  approveTrainer(id: number) {
    console.log('Trainer approved:', id);
  }

  rejectTrainer(id: number) {
    console.log('Trainer rejected:', id);
  }

  loadMoreTrainers() {
    console.log('Loading more trainer requests...');
  }

  approveAssignment(id: number) {
    console.log('Assignment approved:', id);
  }

  rejectAssignment(id: number) {
    console.log('Assignment rejected:', id);
  }

  loadMoreAssignments() {
    console.log('Loading more assignment requests...');
  }

}
