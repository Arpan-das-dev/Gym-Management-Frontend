import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/components/navbar/navbar";
import { Login } from "./featured/auth/login/login";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Login, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('GymManagement');
}
