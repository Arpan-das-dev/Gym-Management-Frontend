import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faDumbbell, faEnvelope, faIdBadge, faMailBulk, faMailForward, faMailReply, faPhone, faTrash, faUser, faUserAlt, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { Authservice } from '../../../core/services/authservice';
import { Router } from '@angular/router';
import { userDetailModel } from '../../../core/Models/signupModel';
import { Navbar } from "../navbar/navbar";

@Component({
  selector: 'app-profile-card',
  imports: [NgStyle, FontAwesomeModule, Navbar],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard {
  icons = {
    member : faUser,
        trainer : faDumbbell ,
        admined : faUserShield,
        camera : faCamera,
        trash: faTrash,
        id: faIdBadge,
        user: faUserTie,
        mail: faEnvelope,
        phone: faPhone
  }

  user: userDetailModel = {
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
  constructor(private authservice : Authservice, private router : Router){}
}
