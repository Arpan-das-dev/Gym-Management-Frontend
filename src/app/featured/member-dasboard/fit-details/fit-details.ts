import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faLeftLong,
  faRightLong,
  faCalendar,
  faHeartbeat,
  faFire,
  faChartLine,
  faTableList,
  faChartColumn,
  faPlus,
  faTimes,
  faInfoCircle,
  faTrash,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';

import { DatePipe, NgClass } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Authservice } from '../../../core/services/authservice';
import { MemberService } from '../../../core/services/member-service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  allWeightBmiEntries,
  MemberWeighBmiEntryResponseDto,
  MonthlySummary,
  MonthlySummaryList,
} from '../../../core/Models/MemberServiceModels';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { FormsModule } from '@angular/forms';
import { NotifyService } from '../../../core/services/notify-service';
import { LoadingService } from '../../../core/services/loading-service';

Chart.register(...registerables);

@Component({
  selector: 'app-fit-details',
  standalone: true,
  imports: [FontAwesomeModule, NgClass, DatePipe, FormsModule],
  templateUrl: './fit-details.html',
  styleUrls: ['./fit-details.css'],
})
export class FitDetails implements AfterViewInit {
  constructor(
    private auth: Authservice,
    private member: MemberService,
    private route: Router,
    private notify: NotifyService,
    private loader: LoadingService
  ) {}

  // Icons
  icons = {
    exclamationCircle: faExclamationCircle,
    checkCircle: faCheckCircle,
    left: faLeftLong,
    right: faRightLong,
    calender: faCalendar,
    heartbeat: faHeartbeat,
    fire: faFire,
    chart: faChartLine,
    table: faTableList,
    stats: faChartColumn,
    add: faPlus,
    close: faTimes,
    info: faInfoCircle,
    trash: faTrash,
  };

  // ---------------- VIEW MODES -----------------
  viewMode: 'daily' | 'table' | 'monthly' = 'daily';
  setViewMode(mode: 'daily' | 'table' | 'monthly') {
    this.viewMode = mode;

    if (mode === 'daily') {
      setTimeout(() => this.updateDailyChart(), 80);
    }

    if (mode === 'table') {
      // no chart
    }

    if (mode === 'monthly') {
      if (!this.monthlyLoaded) {
        this.loadMonthlySummary();
      } else {
        setTimeout(() => this.updateMonthlyChart(), 80);
      }
    }
  }

  // ---------------- DAILY BMI ENTRIES -----------------

  userId = '';
  bmiHistory: MemberWeighBmiEntryResponseDto[] = [];
  page = 0;
  pageSize = 30;
  lastPage = false;
  totalPages = 0;

  date = new Date().toISOString();

  chart: Chart | null = null;

  ngAfterViewInit() {
    setTimeout(() => {
      this.userId = this.auth.getUserId();
      this.loadDailyEntries();
    }, 0);
  }

  loadDailyEntries() {
    this.loader.show('Fetching BMI Entries', faFire);
    this.member
      .getAllWeightBmiEntriesByMemberId(this.userId, this.page, this.pageSize)
      .subscribe({
        next: (res: allWeightBmiEntries) => {
          this.bmiHistory = res.bmiEntryResponseDtoList;
          this.lastPage = res.lastPage;
          this.totalPages = res.totalPages;

          this.loader.hide();
          this.notify.showSuccess('Daily data loaded');

          if (this.viewMode === 'daily') {
            setTimeout(() => this.updateDailyChart(), 80);
          }
        },
        error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          this.loader.hide();
          const msg = error?.error?.message || 'Failed to fetch BMI entries';
          this.notify.showError(msg);
        },
      });
  }

  loadOlder() {
    if (!this.lastPage) {
      this.page++;
      this.loadDailyEntries();
    }
  }

  loadPrevious() {
    if (this.page > 0) {
      this.page--;
      this.loadDailyEntries();
    }
  }

  // DAILY LINE CHART
  updateDailyChart(): void {
    if (!this.bmiHistory.length) return;

    const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
    if (!canvas) {
      return setTimeout(() => this.updateDailyChart(), 50) as unknown as void;
    }

    if (this.chart) this.chart.destroy();

    const dates = this.bmiHistory.map((d) => d.date);
    const weight = this.bmiHistory.map((d) => d.weight);
    const bmi = this.bmiHistory.map((d) => d.bmi);

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Weight (kg)',
            data: weight,
            borderColor: '#f97316',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'BMI',
            data: bmi,
            borderColor: '#06b6d4',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e5e7eb' } },
        },
        scales: {
          x: { ticks: { color: '#d1d5db' } },
          y: { ticks: { color: '#d1d5db' } },
        },
      },
    });
  }

  // ---------------- MONTHLY SUMMARY -----------------

  monthlyLoaded = false;
  monthlyPage = 0;
  monthlyPageSize = 12;
  monthlyLastPage = false;

  monthlySummaries: MonthlySummary[] = [];
  monthlyChart: Chart | null = null;

  readonly monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  loadMonthlySummary() {
    this.loader.show('Fetching Monthly Progress', faCalendar);
    this.member
      .getMatrixOfWeightBmi(this.userId, this.monthlyPage, this.monthlyPageSize)
      .subscribe({
        next: (res: MonthlySummaryList) => {
          this.monthlySummaries = res.summaryResponseDto;
          this.monthlyLastPage = res.lastPage;
          console.log(res);
          if (!res.summaryResponseDto || res.summaryResponseDto.length === 0) {
            console.warn('No monthly summaries found');
            this.monthlyLoaded = true;
            this.loader.hide();
            return;
          }
          console.log(res.summaryResponseDto[0].year);
          this.monthlyLoaded = true;
          this.loader.hide();

          setTimeout(() => this.updateMonthlyChart(), 70);
        },
        error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          this.loader.hide();
          const msg = error?.error?.message || 'Failed to fetch BMI summaries';
          this.notify.showError(msg);
        },
      });
  }

  updateMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.updateMonthlyChart(), 40);
      return;
    }

    if (this.monthlyChart) this.monthlyChart.destroy();

    const labels = this.monthlySummaries.map((m) => {
      const monthName = this.monthLabels[m.monthValue - 1];
      const label = `${monthName} ${m.year} (${m.entryCount})`;
      return label;
    });

    const avgBmi = this.monthlySummaries.map((x) => x.avgBmi);
    const minBmi = this.monthlySummaries.map((x) => x.minBmi);
    const maxBmi = this.monthlySummaries.map((x) => x.maxBmi);
    const avgW = this.monthlySummaries.map((x) => x.avgWeight);
    const minW = this.monthlySummaries.map((x) => x.minWeight);
    const maxW = this.monthlySummaries.map((x) => x.maxWeight);

    this.monthlyChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg BMI',
            data: avgBmi,
            backgroundColor: 'rgba(249,115,22,0.7)',
          },
          {
            label: 'Min BMI',
            data: minBmi,
            backgroundColor: 'rgba(59,130,246,0.7)',
          },
          {
            label: 'Max BMI',
            data: maxBmi,
            backgroundColor: 'rgba(234,179,8,0.8)',
          },
          {
            label: 'Avg Weight',
            data: avgW,
            backgroundColor: 'rgba(45,212,191,0.8)',
          },
          {
            label: 'Min Weight',
            data: minW,
            backgroundColor: 'rgba(56,189,248,0.8)',
          },
          {
            label: 'Max Weight',
            data: maxW,
            backgroundColor: 'rgba(248,113,113,0.8)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e5e7eb' } },
        },
        scales: {
          x: { ticks: { color: '#cbd5e1' } },
          y: { ticks: { color: '#cbd5e1' } },
        },
      },
    });
  }

  // ---------------- BMI COLOR LOGIC ------------------
  getBmiClass(bmi: number) {
    if (bmi < 18.5) return 'text-blue-400';
    if (bmi <= 24.9) return 'text-green-400';
    if (bmi <= 29.9) return 'text-yellow-300';
    return 'text-red-400';
  }

  getBmiLabel(bmi: number) {
    if (bmi < 18.5) return 'Under';
    if (bmi <= 24.9) return 'Normal';
    if (bmi <= 29.9) return 'Over';
    return 'Obese';
  }

  // ---------------- ADD PANEL ------------------
  showAddPanel = false;
  newEntry = { date: '', weight: 0, bmi: 0 };
  heightCm = 0;
  showBmiHelper = false;
  saving = false;

  openAddPanel() {
    this.showAddPanel = true;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  }
  closeAddPanel() {
    this.showAddPanel = false;
  }

  toggleBmiHelper() {
    this.showBmiHelper = !this.showBmiHelper;
  }

  onWeightOrHeightChange() {
    if (this.newEntry.weight && this.heightCm) {
      const hm = this.heightCm / 100;
      this.newEntry.bmi = +(this.newEntry.weight / (hm * hm)).toFixed(1);
    }
  }

  saveNewEntry() {
    this.loader.show('saving new entry for BMI', faRedo);

    this.member
      .addNewWeightBmiEntry(
        this.userId,
        this.newEntry.weight,
        this.newEntry.bmi,
        new Date(this.newEntry.date)
      )
      .subscribe({
        next: (res: genericResponseMessage) => {
          this.closeAddPanel();
          this.loadDailyEntries();
          this.updateMonthlyChart();
          this.loader.hide();
          this.notify.showSuccess(res.message || 'BMI log added');
          this.saving = false;
        },
        error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          const errorMessage = error?.error?.message
            ? error.error.message
            : 'Failed to save entry';
          console.log(error);
          this.loader.hide();
          this.notify.showError(errorMessage);
          this.saving = false;
        },
      });
  }

  deleteEntry(item: MemberWeighBmiEntryResponseDto) {
    this.loader.show('Deleting entries', faTrash);

    this.member.deleteEntries(this.userId, new Date(item.date)).subscribe({
      next: (res: genericResponseMessage) => {
        console.log(res);
        this.loadDailyEntries();
        this.loader.hide();
        this.notify.showSuccess(res.message || 'Entry removed');
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
        const errorMessage = error?.error?.message
          ? error.error.message
          : 'Failed to save entry';
        console.log(error);
        this.loader.hide();
        this.notify.showError(errorMessage);
        this.saving = false;
      },
    });
  }
}
