import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faCheckCircle,
  faCogs,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { PlanService } from '../../../core/services/plan-service';
import { GenericResponse } from '../../../core/Models/genericResponseModels';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AllMonthlyRevenueWrapperResponseDto,
  AllPlanIncomes,
  AllRecentTransactionsResponseWrapperDto,
  MonthlyReviewResponseDto,
  PlanLifeTimeIncome,
  QuickStatsResponseDto,
  RecentTransactionsResponseDto,
} from '../../../core/Models/planModel';
import { AdminService } from '../../../core/services/admin-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart,registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-monthly-revenue',
  imports: [FontAwesomeModule, NgClass, FormsModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './monthly-revenue.html',
  styleUrl: './monthly-revenue.css',
})
export class MonthlyRevenue implements OnInit {
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
  // boolean values for better ui and animations
  loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  icons = {
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    arrowLeft : faArrowLeft,
    arrowUp : faArrowUp,
    arrowRight : faArrowRight
  };
  constructor(private planService: PlanService, private admin: AdminService, private router : Router) {}
  ngOnInit(): void {
    this.getLifeTimeIncome();
    this.loadAvailableYears();
  }
  lifeTimeIncome: number = 0.0;
  getLifeTimeIncome() {
    this.loading = true;
    this.messageText = 'Loading lifeTime income';
    this.planService.getLifetimeIncome().subscribe({
      next: (res: GenericResponse) => {
        this.lifeTimeIncome = new Number(res.message).valueOf();
        console.log('fetched total life time income as ==>' + res.message);
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'Life time income loaded successfully'
        );
        this.getQuickStats();
       
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load Life Time Income Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  quickStats: QuickStatsResponseDto = {
    todayIncome: 0.0,
    monthlyIncome: 0.0,
    yearlyIncome: 0.0,
  };
  getQuickStats() {
    this.loading = true;
    this.messageText = 'Loading quick stats';
    this.planService.getQuickStats().subscribe({
      next: (res: QuickStatsResponseDto) => {
        this.quickStats = res;
        console.log('fetched quick stats from backend');
        console.log(res);
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'Quick Stats loaded successfully'
        );
         this.getRevenuePerPlan();
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load Quick Stats Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }
  yearList: number[] = [];
  loadAvailableYears() {
    this.loading = true;
    this.messageText = 'Loading available years for revenue data';
    this.planService.getYearList().subscribe({
      next: (res) => {
        if (res.yarList.lenght == 0) {
          this.yearList.push(new Date().getFullYear());
          this.loading = false;
          this.showFullScreenMessage(
            'success',
            'No data found for previous years, showing current year'
          );
          return;
        }
        this.yearList = res.yarList || [];
        this.selectedYear = this.yearList.sort((a, b) => b - a)[0];
        console.log('Fetched Available Year list from backend');
        console.log(res);
        this.loading = false;
        this.showFullScreenMessage(
          'success',
          'Fetched available years successfully'
        );
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load Available Years Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  revenueTrendData: MonthlyReviewResponseDto[] = [];
  selectedYear: number = 0;
  loadRevenueTrendByYear() {
    if (!this.yearList.includes(this.selectedYear)) {
      this.showFullScreenMessage(
        'error',
        'Selected year is not available in the data'
      );
      return;
    }
    if (this.selectedYear <= 0) {
      this.showFullScreenMessage(
        'error',
        'Please select a valid year to load revenue trend'
      );
      return;
    }
    this.loading = true;
    this.messageText = `Loading revenue trend for year ${this.selectedYear}`;
    this.planService.getRevenuePerMonth(this.selectedYear).subscribe({
      next: (res: AllMonthlyRevenueWrapperResponseDto) => {
        this.revenueTrendData = res.reviewResponseDtoList || [];
        console.log('Fetched revenue trend data for year ' + this.selectedYear);
        console.log(res);
        this.loading = false;
        setTimeout(() => {
          this.buildRevenueChart();
        }, 100);
        this.showFullScreenMessage(
          'success',
          `Fetched revenue trend for year ${this.selectedYear} successfully`
        );
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load Revenue Trend Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  revenuePerPlan: PlanLifeTimeIncome[] = [];
  getRevenuePerPlan() {
    this.loading = true;
    this.messageText = 'Loading revenue per plan data';
    this.planService.getReveneueGeneratedByEachePlan().subscribe({
      next: (res: AllPlanIncomes) => {
        console.log('fetched result from backend');
        console.log(res);
        this.revenuePerPlan = Object.values(res);
      },
      error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
        console.log('Error Occured ::=>');
        console.log(err);
        const errorMessage = err?.err?.message
          ? err?.err?.message
          : 'Failed To Load Revenue Per Plan Due to Internal Error';
        this.loading = false;
        this.showFullScreenMessage('error', errorMessage);
      },
    });
  }

  viewRecentTransactions(){
    this.loadRecentTransactions();
    this.viewMode = true;
  }

  closeViewMode(){
    this.viewMode = false;
  }

  transactions: RecentTransactionsResponseDto[] = [];
  viewMode : boolean = false;
  sortDirection: string = 'DESC';
  pageNo: number = 0;
  pageSize: number = 20;
  totalPages: number = 0;
  isLast: boolean = false;
  totalElements: number = 0;
  loadRecentTransactions() {
    this.loading = true;
    this.messageText = 'Loading recent transactions';
    this.admin
      .getRecentTransactions(
        '',
        'date',
        this.sortDirection,
        this.pageNo,
        this.pageSize
      )
      .subscribe({
        next: (res: AllRecentTransactionsResponseWrapperDto) => {
          this.transactions = res.responseDtoList || [];
          this.pageNo = res.pageNo;
          this.pageSize = res.pageSize;
          this.totalPages = res.totalPages;
          this.isLast = res.lastPage;
          this.totalElements = res.totalElements;
          console.log('fetched recent transactions from backend');
          console.log(res);
          this.loading = false;
          this.showFullScreenMessage(
            'success',
            'Fetched recent transactions successfully'
          );
        },
        error: (err: erroResponseModel & { err: HttpErrorResponse }) => {
          console.log('Error Occured ::=>');
          console.log(err);
          const errorMessage = err?.err?.message
            ? err?.err?.message
            : 'Failed To Load Recent Transactions Due to Internal Error';
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
      });
  }
  goNextPage() {
    if (this.isLast) {
      this.showFullScreenMessage('error', 'No more pages to load');
      return;
    }
    this.pageNo ++;
    this.loadRecentTransactions();
  }
  goPreviousPage() {
    if (this.pageNo <= 0) {
      this.showFullScreenMessage('error', 'You are already on the first page');
      return;
    }
    this.pageNo --;
    this.loadRecentTransactions();
  }

  handleNavigation(){
    this.router.navigate(['recentTransactions']);
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

 revenueChart?: Chart;
  private buildRevenueChart(): void {
  // destroy old chart (important)
  if (this.revenueChart) {
    this.revenueChart.destroy();
    this.revenueChart = undefined;
  }

  if (!this.revenueTrendData || this.revenueTrendData.length === 0) {
    return;
  }

  const labels = this.revenueTrendData.map(d => d.month);
  const revenues = this.revenueTrendData.map(d => d.revenue);

  this.revenueChart = new Chart('revenueChart', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenues,
          borderColor: '#f97316',      // orange-500
          backgroundColor: 'rgba(249,115,22,0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff',
          borderWidth: 3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#334155' } // slate-700
        },
        tooltip: {
          callbacks: {
            label: ctx => `₹ ${ctx.parsed.y !== null ? ctx.parsed.y.toLocaleString() : '0'}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b' }, // slate-500
          grid: { display: false }
        },
        y: {
          ticks: {
            color: '#64748b',
            callback: value => `₹ ${value}`
          },
          grid: { color: '#e5e7eb' } // gray-200
        }
      }
    }
  });
}

}
