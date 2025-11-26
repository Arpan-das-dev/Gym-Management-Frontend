import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Authservice } from '../../../core/services/authservice';
import { MemberService } from '../../../core/services/member-service';
import { Router } from '@angular/router';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePipe, NgClass } from '@angular/common';
import {
  faCogs,
  faExclamationCircle,
  faCheckCircle,
  faLeftLong,
  faCalendar,
  faHeartbeat,
  faFire,
  faPlus,
  faXmark,
  faTableCellsLarge,
  faChartLine,
  faInfoCircle,
  faTrash,
  faDumbbell,
  faWeightScale,
  faRightLong,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import {
  allWeightBmiEntries,
  MemberWeighBmiEntryResponseDto,
} from '../../../core/Models/MemberServiceModels';
import { HttpErrorResponse } from '@angular/common/http';
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
import { FormsModule } from '@angular/forms';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);
@Component({
  selector: 'app-fit-details',
  imports: [FontAwesomeModule, NgClass, DatePipe, FormsModule],
  templateUrl: './fit-details.html',
  styleUrl: './fit-details.css',
})
export class FitDetails implements AfterViewInit {
  // global variables
  userId: string = '';
  // global loading screen animations
  loading = false;
  showMessage = false;
  messageText = '';
  globalLoadinText = '';
  messageType: 'success' | 'error' = 'success';
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
      this.icons.loading = faCogs;
    }, 5000);
  }

  // global icons
  icons = {
    loading: faCogs,
    exclamationCircle: faExclamationCircle,
    checkCircle: faCheckCircle,
    left: faLeftLong,
    right: faRightLong,
    calender: faCalendar,
    heartbeat: faHeartbeat,
    fire: faWeightScale,
    add: faPlus,
    close: faXmark,
    table: faTableCellsLarge,
    chart: faChartLine,
    info: faInfoCircle,
    trash: faTrash,
  };
  constructor(
    private auth: Authservice,
    private member: MemberService,
    private route: Router
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.userId = this.auth.getUserId();
      this.loadWeightBmiEntries();
    });
  }

  // bmi - weight data and variables
  bmiHistory: MemberWeighBmiEntryResponseDto[] = [];
  page = 0;
  pageSize = 15;
  totalPages = 0;
  lastPage = false;
  chart: Chart | null = null;
  showTableView = false;

  // slide-over panel state
  showAddPanel = false;
  showBmiHelper = false;
  saving = false;
  date: string= new Date().toLocaleDateString().split('T')[0]
  // add new log variables and datas
  newEntry: { date: string | null; weight: number | null; bmi: number | null } =
    {
      date: null,
      weight: null,
      bmi: null,
    };
  heightCm: number | null = null;

  toggleView() {
    this.showTableView = !this.showTableView;
    if (!this.showTableView) {
      setTimeout(() => {
        this.updateChart();
      }, 50);
    }
  }

  loadWeightBmiEntries() {
    this.loading = true;
    this.globalLoadinText = 'Fetching BMI Entries';
    this.icons.loading = faDumbbell;
    this.member
      .getAllWeightBmiEntriesByMemberId(this.userId, this.page, this.pageSize)
      .subscribe({
        next: (res: allWeightBmiEntries) => {
          // console.log('fetched data == ', res);
          this.lastPage = res.lastPage;
          this.totalPages = res.totalPages;
          this.bmiHistory = res.bmiEntryResponseDtoList;
          this.page = res.pageNo
          this.pageSize = res.pageSize
          console.log(`is it last page ? ${this.lastPage} total pages are ${this.totalPages} 
            \n current page no is ${this.page} and page size is ${this.pageSize} loaded data are no ${res.bmiEntryResponseDtoList.length}`);
          
          setTimeout(() => this.updateChart(), 10);
          this.loading = false;
          this.showFullScreenMessage('success', 'Retrieved all data');
        },
        error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          const errorMessage = error?.error?.message
            ? error.error.message
            : 'Failed to get profile image';
          console.log('error caused due to ', errorMessage);
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },
      });
  }
  loadOlder() {
    if (this.lastPage) return;
    this.page++;
    console.log(this.lastPage);
    
    this.loadWeightBmiEntries();
  }
  loadPrevious(){
    this.page --;
    this.loadWeightBmiEntries()
    console.log(this.lastPage);
    console.log("elements left",this.totalPages);
    
  }
  updateChart() {
    if (!this.bmiHistory || this.bmiHistory.length === 0) return;
    const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
    if (!canvas) {
      console.log('Canvas not found yet, retrying...');
      setTimeout(() => this.updateChart(), 50);
      return;
    }

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dates = this.bmiHistory.map((d) => new Date(d.date).toLocaleDateString('en-us', options));
    const weights = this.bmiHistory.map((d) => d.weight);
    const bmis = this.bmiHistory.map((d) => d.bmi);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart('weightChart', {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Weight (kg)',
            data: weights,
            borderColor: 'orange',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'BMI',
            data: bmis,
            borderColor: 'cyan',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            ticks: { color: '#ccc' },
          },
          y: {
            type: 'linear',
            ticks: { color: '#ccc' },
          },
        },
      },
    });
  }

  // ====== BMI helpers (colors + labels) ======

  getBmiLabel(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBmiClass(bmi: number): string {
    if (bmi < 18.5) return 'text-blue-300'; // underweight
    if (bmi < 25) return 'text-emerald-300'; // healthy
    if (bmi < 30) return 'text-orange-300'; // overweight
    return 'text-red-400'; // obese
  }

  // ====== Add BMI Panel Handling ======

  openAddPanel() {
    const today = new Date().toISOString().substring(0, 10);
    this.newEntry = {
      date: today,
      weight: null,
      bmi: null,
    };
    this.heightCm = null;
    this.showBmiHelper = false;
    this.showAddPanel = true;
  }

  closeAddPanel() {
    this.showAddPanel = false;
  }

  toggleBmiHelper() {
    this.showBmiHelper = !this.showBmiHelper;
  }

  onWeightOrHeightChange() {
    if (!this.showBmiHelper) return;
    if (!this.newEntry.weight || !this.heightCm) return;

    const hMeters = this.heightCm / 100;
    if (hMeters <= 0) return;

    const bmi = this.newEntry.weight / (hMeters * hMeters);
    this.newEntry.bmi = Math.round(bmi * 10) / 10; // 1 decimal place
  }

  saveNewEntry() {
    if (!this.newEntry.date || this.newEntry.weight == null || this.newEntry.bmi == null) {
      return;
    }
    this.loading = true;
    this.globalLoadinText = 'Updating Entries'
    this.saving = true;
    this.page =0;
    this.icons.loading = faRedo;
    this.member.addNewWeightBmiEntry(this.userId,this.newEntry.weight, this.newEntry.bmi).subscribe({
      next :(res:genericResponseMessage) => {
        console.log(res.message);
        this.loadWeightBmiEntries()
        this.loading = false;
        this.showFullScreenMessage('success',res.message || 'new bmi entries updated successfully')
      },
      error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          const errorMessage = error?.error?.message
            ? error.error.message
            : 'Failed to get profile image';
          console.log('error caused due to ', errorMessage);
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        },      
    })
  }

  // ====== Delete entry per row ======

  deleteEntry(entry: MemberWeighBmiEntryResponseDto) {
    
    this.loading = true;
    this.globalLoadinText = 'Deleteing Entries';
    this.icons.loading = faTrash;
    this.page =0;
    this.member.deleteEntries(this.userId, new Date(entry.date)).subscribe({
      next :(res: genericResponseMessage) => {
         console.log(res.message);
        this.loadWeightBmiEntries()
        this.loading = false;
        this.showFullScreenMessage('success',res.message || 'new bmi entries updated successfully')
      },error: (error: HttpErrorResponse & { error: erroResponseModel }) => {
          const errorMessage = error?.error?.message
            ? error.error.message
            : 'Failed to get profile image';
          console.log('error caused due to ', errorMessage);
          this.loading = false;
          this.showFullScreenMessage('error', errorMessage);
        }
    })
  }
}
