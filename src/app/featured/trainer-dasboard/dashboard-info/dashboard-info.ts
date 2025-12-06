import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Authservice } from '../../../core/services/authservice';
import { TrainerService } from '../../../core/services/trainer-service';
import { LoadingService } from '../../../core/services/loading-service';
import { NotifyService } from '../../../core/services/notify-service';
import { TrainerDashBoardInfoResponseDto } from '../../../core/Models/TrainerServiceModels';
import { faArrowDown, faArrowUp, faCalendar, faChartBar, faCogs, faMinus, faStar, faUsers } from '@fortawesome/free-solid-svg-icons';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-info',
  imports: [FontAwesomeModule],
  templateUrl: './dashboard-info.html',
  styleUrl: './dashboard-info.css',
})
export class DashboardInfo implements OnInit{
  private trainerId : string = ''
  constructor(
    private auth: Authservice,
    private trainer: TrainerService,
    private loader: LoadingService,
    private notify: NotifyService
  ) {
    this.trainerId = auth.getUserId()
  }
  ngOnInit(): void {
      this.getDashboardInfo()
  }
  icons = {
    users : faUsers,
    arrowUp : faArrowUp,
    arrowDown : faArrowDown,
    minus : faMinus,
    calendar : faCalendar,
    star : faStar,
    chart : faChartBar
  }
  dashboardInfo!: TrainerDashBoardInfoResponseDto;
  getDashboardInfo() {
    this.loader.show("Fetching Dashboard Matrices",faCogs)
    this.trainer.getDashboardInfo(this.trainerId).subscribe({
      next:(res:TrainerDashBoardInfoResponseDto) => {
        console.log(`fetched reponse from backend as --> \n`,res);
        this.dashboardInfo = res 
        this.loader.hide();
        this.notify.showSuccess('Successfully Loaded DashBoard Info');       
      }, error : (err: erroResponseModel & {err: HttpErrorResponse}) => {
        const message = err?.err?.message ? err?.err?.message : 'Failed to Load Due to Internal Error';
        console.log(err);
        console.log(`fetched the error message --> ${message}`);
        this.loader.hide();
        this.notify.showError(message);
      }
    })
  }
}
