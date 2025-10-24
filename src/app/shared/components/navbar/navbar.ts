
import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  isLoggedIn = false;
  userRole: string | null = null;
  constructor(private authservice: Authservice, private router: Router){
    
  }
  logout(){

  }
  ngOnInit(): void {
      
  }
}
