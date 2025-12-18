import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCookieBite,
  faShieldHalved,
  faGear,
  faEye,
  faClock,
  faGlobe,
  faToggleOn,
  faTriangleExclamation,
  faEnvelope,
  faCircleInfo,
  faDatabase,
  faLock,
  faUserCheck,
  faMobileScreen
} from '@fortawesome/free-solid-svg-icons';
import { Footer } from "../components/footer/footer";
import { Navbar } from "../components/navbar/navbar";
@Component({
  selector: 'app-cookie-policy',
  imports: [FontAwesomeModule, Footer, Navbar],
  templateUrl: './cookie-policy.html',
  styleUrl: './cookie-policy.css',
})
export class CookiePolicy {
lastUpdated = 'December 3, 2025';

  icons = {
    cookie: faCookieBite,
    shield: faShieldHalved,
    settings: faGear,
    eye: faEye,
    clock: faClock,
    globe: faGlobe,
    toggle: faToggleOn,
    warning: faTriangleExclamation,
    mail: faEnvelope,
    info: faCircleInfo,
    database: faDatabase,
    lock: faLock,
    userCheck: faUserCheck,
    mobile: faMobileScreen,
  };

  sections = [
    {
      id: 'introduction',
      icon: this.icons.cookie,
      title: 'Introduction to Cookies',
      content: `This Cookie Policy explains how FitStudio uses cookies and similar technologies to deliver a secure, personalized, and high-performance fitness platform.`
    },
    {
      id: 'what-are-cookies',
      icon: this.icons.info,
      title: 'What Are Cookies?',
      content: `Cookies are small text files stored on your device that help websites remember your preferences and improve usability.`
    },
    {
      id: 'essential-cookies',
      icon: this.icons.lock,
      title: 'Essential Cookies',
      content: `These cookies are required for authentication, security, and role-based access control. Without them, FitStudio cannot function properly.`
    },
    {
      id: 'session-storage',
      icon: this.icons.clock,
      title: 'Session Storage',
      content: `Session storage is used for short-lived verification states such as email and phone verification.`
    },
    {
      id: 'analytics',
      icon: this.icons.eye,
      title: 'Analytics & Performance',
      content: `Analytics cookies help us understand platform usage and improve performance without identifying individual users.`
    },
    {
      id: 'third-party',
      icon: this.icons.globe,
      title: 'Third-Party Cookies',
      content: `Some integrations such as payments or social login may place their own cookies governed by their respective policies.`
    },
    {
      id: 'security',
      icon: this.icons.shield,
      title: 'Cookie Security',
      content: `We enforce Strict SameSite, HTTPS-only transmission, HttpOnly flags, and encrypted tokens.`
    },
    {
      id: 'manage',
      icon: this.icons.toggle,
      title: 'Managing Cookies',
      content: `You can control cookies through browser settings or our preference center. Disabling essential cookies may limit functionality.`
    },
    {
      id: 'contact',
      icon: this.icons.mail,
      title: 'Contact Us',
      content: `For cookie or privacy concerns, contact us at privacy@fitstudio.com.`
    }
  ];
}
