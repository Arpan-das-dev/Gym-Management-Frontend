import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin-service';
import { Authservice } from '../../core/services/authservice';
import { userDetailModel } from '../../core/Models/signupModel';
import { Navbar } from "../../shared/components/navbar/navbar";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDumbbell, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Navbar, FontAwesomeModule,NgStyle],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  icons = {
    member : faUser,
    trainer : faDumbbell,
    admined : faUserShield
  }
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
}
