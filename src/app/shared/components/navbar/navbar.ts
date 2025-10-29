
import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

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
      this.userRole = this.authservice.getUserRole();
  }
}
