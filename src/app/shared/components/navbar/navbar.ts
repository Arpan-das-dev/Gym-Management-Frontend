
import { Component,  OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterLink,NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  isMenuOpen = false;
  isLoggedIn = false;
  userRole: string | null = null;
  constructor(private authservice: Authservice, private router: Router){
    
  }
  logout(){
    this.authservice.logout();
    this.router.navigate(['/login'])
  }
  ngOnInit(): void {
      this.isLoggedIn = this.authservice.isLoggedIn();
      console.log("hello the out put is "+this.authservice.isLoggedIn());
      this.userRole = this.authservice.getUserRole();
  }
  hadleNavigation(){
    this.router.navigate(['/dashboard']);
  }
}
