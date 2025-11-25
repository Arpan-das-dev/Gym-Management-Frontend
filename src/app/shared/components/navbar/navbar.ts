
import { Component,  OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterLink,NgClass],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
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
  //     this.router.events.subscribe(event => {
  //   // if (event instanceof NavigationStart) {

  //   //   const role = this.authservice.getRole() || this.authservice.getUserRole();

  //   //   // Prevent user from landing on wrong route before guard blocks them
  //   //   if (event.url === '/' || event.url === '/dashboard' || event.url === '/login') {
        
  //   //     if (role?.includes('MEMBER')) {
  //   //       this.router.navigate(['/member-dashboard']);
  //   //     } 
  //   //     else if (role?.includes('TRAINER') || role?.includes('TRAINER_PENDING')) {
  //   //       this.router.navigate(['/trainer-dashboard']);
  //   //     } 
  //   //     else if (role?.includes('ADMIN')) {
  //   //       this.router.navigate(['/dashboard']);
  //   //     }
  //   //   }
  //   // }
  // });
  }
  handleNavigation() {
  console.log("➡️ [Navigation] Running handleNavigation()");

  const role = this.authservice.getRole() || this.authservice.getUserRole();
  console.log("ℹ️ [Navigation] User role:", role);

  if (!role) {
    console.log("❌ [Navigation] No role found → redirect to login");
    this.router.navigate(['/login']);
    return;
  }

  if (role.includes('MEMBER')) {
    console.log("➡️ [Navigation] Navigating to MEMBER dashboard");
    this.router.navigate(['/member-dashboard']);
    return;
  }

  if (role.includes('TRAINER')) {
    console.log("➡️ [Navigation] Navigating to TRAINER dashboard");
    this.router.navigate(['/trainer-dashboard']);
    return;
  }

  // 🔥 Trainer-Pending gets routed to Trainer dashboard (your rule)
  if (role.includes('TRAINER_PENDING')) {
    console.log("➡️ [Navigation] TRAINER_PENDING → trainer-dashboard (custom rule)");
    this.router.navigate(['/trainer-dashboard']);
    return;
  }

  if (role.includes('ADMIN')) {
    console.log("➡️ [Navigation] Navigating to ADMIN dashboard");
    this.router.navigate(['/dashboard']);
    return;
  }

  
}
goToLogin(){
  console.log('its triggered now goin to login page');
  
  this.router.navigate(['login'])
}

}

