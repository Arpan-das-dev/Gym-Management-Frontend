import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Footer } from '../components/footer/footer';
import { Navbar } from '../components/navbar/navbar';
import {
  faShieldHalved,
  faEye,
  faDatabase,
  faShareNodes,
  faLock,
  faBell,
  faGlobe,
  faUsers,
  faTrash,
  faBaby,
  faScaleBalanced,
  faEnvelope,
  faFileLines,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-privacy-policy',
  imports: [FontAwesomeModule,Footer,Navbar],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css',
})
export class PrivacyPolicy {
lastUpdated = 'December 2, 2025';
  effectiveDate = 'December 2, 2025';

  icons = {
    shield: faShieldHalved,
    eye: faEye,
    database: faDatabase,
    share: faShareNodes,
    lock: faLock,
    bell: faBell,
    globe: faGlobe,
    users: faUsers,
    trash: faTrash,
    baby: faBaby,
    scale: faScaleBalanced,
    mail: faEnvelope,
    file: faFileLines,
    refresh: faRotate,
  };

  sections = [
    {
      icon: this.icons.file,
      title: '1. Introduction',
      content: `This Privacy Policy ("Policy") describes how Fitness Hub ("we," "us," or "our") collects, uses, discloses, and protects your personal information when you use our website, mobile applications, and fitness services (collectively, the "Services").

By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Policy. If you do not agree with our privacy practices, please do not use our Services.

We are committed to protecting your privacy and ensuring the security of your personal information. This Policy applies to all users of our Services, including members, trainers, administrators, and visitors.`
    },
    {
      icon: this.icons.database,
      title: '2. Information We Collect',
      content: `We collect various types of information to provide and improve our Services:

2.1 Personal Information You Provide:
• Account Information: Name, email address, phone number, date of birth, gender, profile photo
• Payment Information: Credit/debit card details, billing address, transaction history
• Health & Fitness Data: Height, weight, BMI, fitness goals, medical conditions, dietary restrictions
• Communication Data: Messages, feedback, support inquiries, reviews and ratings

2.2 Information Collected Automatically:
• Device Information: IP address, browser type, operating system, device identifiers
• Usage Data: Pages visited, features used, session duration, click patterns
• Location Data: Approximate location based on IP address, GPS data (with consent)
• Cookies & Tracking: Session cookies, persistent cookies, web beacons, pixel tags

2.3 Information from Third Parties:
• Social Media integrations
• Payment processors
• Analytics providers
• Fitness device integrations`
    },
    {
      icon: this.icons.eye,
      title: '3. How We Use Your Information',
      content: `We use the collected information for service delivery, communication, analytics, improvement, and legal compliance.

This includes account management, payments, trainer matching, progress tracking, notifications, fraud prevention, and enforcing our Terms of Service.`
    },
    {
      icon: this.icons.share,
      title: '4. Information Sharing & Disclosure',
      content: `We may share your information with trusted service providers, trainers, staff, legal authorities, or during business transfers.

We only share the minimum data required and never sell personal information.`
    },
    {
      icon: this.icons.lock,
      title: '5. Data Security',
      content: `We use industry-standard security measures including SSL/TLS encryption, AES-256 encryption, role-based access controls, MFA, security audits, and incident response procedures.

No system is 100% secure, but we continuously improve our defenses.`
    },
    {
      icon: this.icons.refresh,
      title: '6. Data Retention',
      content: `We retain personal data only as long as necessary for service delivery, legal obligations, or analytics.

Inactive accounts may be archived and later securely deleted.`
    },
    {
      icon: this.icons.scale,
      title: '7. Your Rights & Choices',
      content: `You have rights to access, correct, delete, restrict processing, withdraw consent, and file complaints.

To exercise these rights, contact privacy@fitnesshub.com.`
    },
    {
      icon: this.icons.bell,
      title: '8. Marketing & Communications',
      content: `We send transactional messages by default. Marketing communications are opt-in and can be disabled at any time.

Push notifications and SMS preferences are configurable.`
    },
    {
      icon: this.icons.globe,
      title: '9. Cookies & Tracking Technologies',
      content: `We use essential, functional, analytics, and advertising cookies. You can manage cookies via browser settings.

Disabling cookies may affect functionality.`
    },
    {
      icon: this.icons.globe,
      title: '10. International Data Transfers',
      content: `Data may be processed internationally with safeguards such as SCCs, GDPR compliance, and adequacy decisions.`
    },
    {
      icon: this.icons.baby,
      title: '11. Children’s Privacy',
      content: `Our Services are not intended for children under 16. We do not knowingly collect data from minors without parental consent.`
    },
    {
      icon: this.icons.users,
      title: '12. Third-Party Services',
      content: `We integrate with social, fitness, analytics, and payment platforms governed by their own privacy policies.`
    },
    {
      icon: this.icons.trash,
      title: '13. Account Deletion',
      content: `Users may delete accounts at any time. Most data is removed within 30 days, with some retained for legal compliance.`
    },
    {
      icon: this.icons.shield,
      title: '14. California Privacy Rights (CCPA)',
      content: `California residents have rights to access, delete, opt-out, and non-discrimination under CCPA.`
    },
    {
      icon: this.icons.refresh,
      title: '15. Policy Updates',
      content: `We may update this policy periodically. Continued use implies acceptance of updates.`
    },
    {
      icon: this.icons.mail,
      title: '16. Contact Us',
      content: `Email: dasarpan915@gmail.com
Phone: +91 8145415374

Last Updated: December 2, 2025
Effective Date: December 2, 2025`
    }
  ];
}
