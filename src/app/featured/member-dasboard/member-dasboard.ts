import { Component } from '@angular/core';
import { ProfileCard } from "./profile-card/profile-card";
import { Navbar } from "../../shared/components/navbar/navbar";
import { FitDetails } from "./fit-details/fit-details";

@Component({
  selector: 'app-member-dasboard',
  imports: [ProfileCard, Navbar, FitDetails],
  templateUrl: './member-dasboard.html',
  styleUrl: './member-dasboard.css',
})
export class MemberDasboard {

}
