import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { ReportAndMessageService } from '../../../core/services/report-and-message-service';

@Component({
  selector: 'app-manage-reports',
  imports: [FontAwesomeModule],
  templateUrl: './manage-reports.html',
  styleUrl: './manage-reports.css',
})
export class ManageReports {
  icons = {
    reports : faExclamationTriangle
  }
  loading = false
  loadingText = ""
  constructor(private router : Router, private reports : ReportAndMessageService){}
  handleNavigation() {
    this.loading = true;
    this.loadingText = "Fetching All Reports"
    this.reports.getAllRequestForAdmin(0,30,'','DESC','ALL','ALL').subscribe({
      next:() =>{
        this.loadingText = "Navigating to All Reports Page"
        setTimeout(()=> {
          this.loading = false;
          this.router.navigate(['viewReports'])
        })
      }
    })
    
  }
}
