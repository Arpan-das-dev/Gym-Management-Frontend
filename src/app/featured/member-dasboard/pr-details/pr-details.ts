import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChartLine,
  faTable,
  faSearch,
  faFilter,
  faRotateLeft,
  faTrash,
  faEdit,
  faPlus,
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTimes,
  faChartBar,
  faSave,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { Chart, registerables } from 'chart.js';
import { Authservice } from '../../../core/services/authservice';
import { MemberService } from '../../../core/services/member-service';
import { LoadingService } from '../../../core/services/loading-service';
import { NotifyService } from '../../../core/services/notify-service';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  PrLists,
  PrProgressRequestDto,
  PrSummaryList,
  PrSummaryResponseDto,
  UpdatePrRequestDto,
} from '../../../core/Models/MemberServiceModels';
import { genericResponseMessage } from '../../../core/Models/genericResponseModels';
import { errorOutPutMessageModel } from '../../../core/Models/errorResponseModel';

Chart.register(...registerables);

@Component({
  selector: 'app-pr-details',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule, NgClass, DatePipe,DecimalPipe],
  templateUrl: './pr-details.html',
  styleUrl: './pr-details.css',
})
export class PrDetails implements AfterViewInit {

  constructor(
    private auth: Authservice,
    private member: MemberService,
    private loader: LoadingService,
    private notify: NotifyService
  ) {}

  // icons
  icons = {
    chart: faChartLine,
    table: faTable,
    stats: faChartBar,
    search: faSearch,
    filter: faFilter,
    reset: faRotateLeft,
    trash: faTrash,
    edit: faEdit,
    add: faPlus,
    calendar: faCalendar,
    left: faChevronLeft,
    right: faChevronRight,
    checkCircle: faCheckCircle,
    close: faTimes,
  };

  // view + unit
  viewType: 'chart' | 'table' | 'summary' = 'table';
  selectedUnit: 'kg' | 'lb' = 'kg';

  // pagination + filters
  memberId = '';
  pageNo = 0;
  pageSize = 15;
  lastPage = false;
  totalPages = 0;
  totalElements = 0;

  searchBy = '';
  sortDirection: 'ASC' | 'DESC' = 'DESC';
  fromDate = '';
  toDate = '';

  // data
  oldPrs: PrProgressRequestDto[] = [];
  groupedPrs: { date: string; entries: PrProgressRequestDto[] }[] = [];

  // chart state
  private prChart?: Chart;

  // add / update panel
  showAddPanel = false;
  updateMode = false;

  // multi rows for add panel
  editRows: (PrProgressRequestDto & { _id: string })[] = [];

  // bodyweight logic
  bodyWeightWorkouts = ['Pull-Up (Bodyweight)', 'Chin-Up (Bodyweight)'];
  memberBodyWeight = 0; // you’ll fill via some member profile API if you want

  // master workout list
  allPrs: string[] = [
    'Squat (Back, Barbell)',
    'Squat (Front, Barbell)',
    'Deadlift (Conventional, Barbell)',
    'Deadlift (Sumo, Barbell)',
    'Bench Press (Flat, Barbell)',
    'Bench Press (Incline, Barbell)',
    'Bench Press (Flat, Dumbbell)',
    'Overhead Press (Standing, Barbell)',
    'Overhead Press (Seated, Dumbbell)',
    'Row (Bent-Over, Barbell)',
    'Row (One-Arm, Dumbbell)',
    'Pull-Up (Bodyweight)',
    'Chin-Up (Bodyweight)',
    'Lunge (Forward, Barbell)',
    'Hip Thrust (Barbell)',
  ];

  // warning dialog
  showWarning = false;
  warningText = '';
  warningAction: (() => void) | null = null;

  // summary (monthly)
  summaryLoaded = false;
  monthlySummaries: PrSummaryResponseDto[] = [];
  private maxWeightInSummary = 1; // for scaling bars

  // ====== LIFECYCLE ======
  ngAfterViewInit(): void {
    this.memberId = this.auth.getUserId();
    this.loadPage();
  }

  // ====== VIEW / UNIT CONTROLS ======
  setViewType(type: 'chart' | 'table' | 'summary') {
    this.viewType = type;

    if (type === 'chart') {
      setTimeout(() => this.buildChart(), 0);
    }
  }

  setUnit(unit: 'kg' | 'lb') {
    if (this.selectedUnit === unit) return;
    this.selectedUnit = unit;
    if (this.viewType === 'chart') {
      setTimeout(() => this.buildChart(), 0);
    }
  }

  // ====== LOAD PAGE (daily PRs) ======
  private loadPage() {
    const from = this.fromDate ? new Date(this.fromDate) : undefined;
    const to = this.toDate ? new Date(this.toDate) : undefined;

    this.loader.show('Fetching PR Records', faDownload);

    this.member
      .getAllPastPrRecords(
        this.memberId,
        this.pageNo,
        this.pageSize,
        this.searchBy,
        this.sortDirection,
        from,
        to
      )
      .subscribe({
        next: (res: PrLists) => {
          this.oldPrs = res.responseDtoList || [];
          this.pageNo = res.pageNo ?? this.pageNo;
          this.pageSize = res.pageSize ?? this.pageSize;
          this.lastPage = res.lastPage ?? false;
          this.totalElements = res.totalElements ?? 0;
          this.totalPages = res.totalPages ?? 0;

          this.buildGroups();
          if (this.viewType === 'chart') {
            setTimeout(() => this.buildChart(), 0);
          }
          this.loader.hide();
          this.notify.showSuccess('Fetched PR records');
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.loader.hide();
          const msg =
            (err.error && err.error.message) ||
            'Failed to load PR entries';
          this.notify.showError(msg);
        },
      });
  }

  applyFilters() {
    this.pageNo = 0;
    this.loadPage();
  }

  resetFilters() {
    this.searchBy = '';
    this.fromDate = '';
    this.toDate = '';
    this.sortDirection = 'DESC';
    this.pageNo = 0;
    this.loadPage();
  }

  nextPage() {
    if (this.lastPage) return;
    this.pageNo++;
    this.loadPage();
  }

  prevPage() {
    if (this.pageNo === 0) return;
    this.pageNo--;
    this.loadPage();
  }

  private buildGroups() {
    const map = new Map<string, PrProgressRequestDto[]>();

    for (const pr of this.oldPrs) {
      const key = pr.achievedDate;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(pr);
    }

    this.groupedPrs = Array.from(map.entries()).map(([date, entries]) => ({
      date,
      entries,
    }));
  }

  itemKey(item: PrProgressRequestDto): string {
    return `${item.workoutName}-${item.achievedDate}-${item.weight}-${item.repetitions}`;
  }

  // ====== DISPLAY HELPERS ======
  getDisplayWeight(item: PrProgressRequestDto): number {
    return this.selectedUnit === 'kg'
      ? item.weight
      : Math.round(item.weight * 2.2);
  }

  getDisplayVolume(item: PrProgressRequestDto): number {
    return this.getDisplayWeight(item) * item.repetitions;
  }

  getRowVolume(r: PrProgressRequestDto): number {
    return (r.weight || 0) * (r.repetitions || 0);
  }

  getWeightClass(weight: number): string {
    if (weight <= 40) return 'weight-low';
    if (weight <= 80) return 'weight-medium';
    if (weight <= 120) return 'weight-high';
    return 'weight-very-high';
  }

  getVolumeClass(volume: number): string {
    if (volume <= 500) return 'volume-low';
    if (volume <= 1500) return 'volume-medium';
    if (volume <= 3000) return 'volume-high';
    return 'volume-very-high';
  }

  // ====== DAILY BAR CHART ======
  private buildChart() {
    if (this.prChart) {
      this.prChart.destroy();
      this.prChart = undefined;
    }

    if (!this.oldPrs || this.oldPrs.length === 0) return;

    const labels = this.oldPrs.map((p) => p.achievedDate);
    const volumes = this.oldPrs.map((p) => this.getDisplayVolume(p));

    this.prChart = new Chart('prChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: `Volume (${this.selectedUnit})`,
            data: volumes,
            backgroundColor: 'rgba(249,115,22,0.8)',
            borderColor: 'rgba(253,224,71,0.9)',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => {
                const i = items[0].dataIndex;
                const pr = this.oldPrs[i];
                return `${pr.workoutName} — ${pr.achievedDate}`;
              },
              label: (ctx) => {
                const index = ctx.dataIndex;
                const pr = this.oldPrs[index];
                const weight = this.getDisplayWeight(pr);
                const volume = this.getDisplayVolume(pr);

                return [
                  `Weight: ${weight}${this.selectedUnit}`,
                  `Reps: ${pr.repetitions}`,
                  `Volume: ${volume}${this.selectedUnit}`,
                ];
              },
            },
          },
          legend: {
            labels: { color: '#e5e7eb' },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#9ca3af',
              maxRotation: 45,
              minRotation: 45,
              font: { size: 10 },
            },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#9ca3af' },
            grid: { color: '#374151' },
          },
        },
      },
    });
  }

  // ====== ADD / UPDATE PANEL ======
  openAddPanel() {
    this.updateMode = false;
    this.editRows = [];
    this.addRow();
    this.showAddPanel = true;
    setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 10);
  }

  addRow() {
    this.editRows.push({
      _id: crypto.randomUUID(),
      workoutName: '',
      weight: 0,
      repetitions: 0,
      achievedDate: '',
    });
  }

  removeRow(id: string) {
    this.editRows = this.editRows.filter((r) => r._id !== id);
  }

  autoFillForBodyWeight(row: any) {
    if (this.bodyWeightWorkouts.includes(row.workoutName) && this.memberBodyWeight > 0) {
      row.weight = this.selectedUnit === 'kg'
        ? this.memberBodyWeight
        : Math.round(this.memberBodyWeight * 2.2);
    }
  }

  closeAddPanel() {
    this.showAddPanel = false;
  }

  submitMulti() {
    if (this.updateMode) {
      // handle update single record from separate flow if you want
      this.notify.showError('Update mode for multi-form not wired yet.');
      return;
    }

    if (this.editRows.length === 0) {
      this.notify.showError('Add at least one PR entry');
      return;
    }

    for (const r of this.editRows) {
      if (!r.workoutName || !r.achievedDate || !r.weight || !r.repetitions) {
        this.notify.showError('All fields are required for each row');
        return;
      }
    }

    const body = this.editRows.map((r) => ({
      workoutName: r.workoutName,
      weight: this.selectedUnit === 'kg' ? r.weight : r.weight / 2.2,
      repetitions: r.repetitions,
      achievedDate: r.achievedDate,
    }));

    this.askWarning('This will save all PR records. Continue?', () => {
      this.loader.show('Saving PR Records', faSave);
      this.member.addNewPr(this.memberId, body).subscribe({
        next: (res: genericResponseMessage) => {
          setTimeout(() => {
          this.loadPage()
          
          this.showAddPanel = false;
          this.pageNo = 0;
          },500)
          this.notify.showSuccess(res.message || 'PR records saved');
          this.loader.hide();
        },
        error: (err: HttpErrorResponse & { error: errorOutPutMessageModel }) => {
          this.loader.hide();
          const msg = err.error?.message || 'Failed to save PR records';
          this.notify.showError(msg);
        },
      });
    });
  }

  startUpdate(item: PrProgressRequestDto) {
    this.updateMode = true;
    this.showAddPanel = true;

    const editWeight =
      this.selectedUnit === 'kg'
        ? item.weight
        : Math.round(item.weight * 2.2);

    this.editRows = [
      {
        _id: crypto.randomUUID(),
        workoutName: item.workoutName,
        weight: editWeight,
        repetitions: item.repetitions,
        achievedDate: item.achievedDate,
      },
    ];
  }


   submitUpdateSingle() {
    if (!this.updateMode || this.editRows.length === 0) return;

    const r = this.editRows[0];
    if (!r.workoutName || !r.achievedDate || !r.weight || !r.repetitions) {
      this.notify.showError('All fields are required');
      return;
    }

    const body: UpdatePrRequestDto = {
      weight: this.selectedUnit === 'kg' ? r.weight : r.weight / 2.2,
      repetitions: r.repetitions,
      archivedDate: r.achievedDate,
    };

    this.askWarning(`Update ${r.workoutName}?`, () => {
      this.loader.show('Updating PR', faSave);
      this.member
        .updateParticularPr(this.memberId, r.workoutName, body)
        .subscribe({
          next: (res: genericResponseMessage) => {
            this.loader.hide();
            this.notify.showSuccess(res.message || 'PR updated');
            this.showAddPanel = false;
            this.loadPage();
          },
          error: (err: HttpErrorResponse & { error: errorOutPutMessageModel }) => {
            this.loader.hide();
            const msg = err.error?.message || 'Failed to update PR';
            this.notify.showError(msg);
          },
        });
    });
  }

  // ====== WARNING POPUP ======
  askWarning(text: string, action: () => void) {
    this.warningText = text;
    this.warningAction = action;
    this.showWarning = true;
  }

  cancelWarning() {
    this.showWarning = false;
    this.warningAction = null;
  }

  confirmWarning() {
    if (this.warningAction) this.warningAction();
    this.showWarning = false;
    this.warningAction = null;
  }

  // ====== DELETE OPERATIONS ======
  confirmDeleteEntry(item: PrProgressRequestDto) {
    this.askWarning(
      `Delete ${item.workoutName} (${item.achievedDate}) ?`,
      () => this.deleteEntry(item)
    );
  }

  private deleteEntry(item: PrProgressRequestDto) {
    this.loader.show('Deleting PR', faTrash);
    this.member
      .deleteOnePr(this.memberId, item.achievedDate, item.workoutName)
      .subscribe({
        next: (res: genericResponseMessage) => {
          this.oldPrs = this.oldPrs.filter(
            (p) =>
              !(
                p.workoutName === item.workoutName &&
                p.achievedDate === item.achievedDate
              )
          );
          this.buildGroups();
          if (this.viewType === 'chart') this.buildChart();
          this.loader.hide();
          this.notify.showSuccess(res.message || 'PR deleted');
        },
        error: (err: HttpErrorResponse & { error: errorOutPutMessageModel }) => {
          this.loader.hide();
          const msg = err.error?.message || 'Failed to delete PR';
          this.notify.showError(msg);
        },
      });
  }

  confirmDeleteDate(date: string) {
    this.askWarning(
      `Delete ALL PR entries for ${date}?`,
      () => this.deleteAllForDate(date)
    );
  }

  private deleteAllForDate(date: string) {
    this.loader.show('Deleting PRs', faTrash);
    this.member.delteBulkPr(this.memberId, date).subscribe({
      next: (res: genericResponseMessage) => {
        this.oldPrs = this.oldPrs.filter((p) => p.achievedDate !== date);
        this.buildGroups();
        if (this.viewType === 'chart') this.buildChart();
        this.loader.hide();
        this.notify.showSuccess(res.message || 'PRs deleted');
      },
      error: (err: HttpErrorResponse & { error: errorOutPutMessageModel }) => {
        this.loader.hide();
        console.log(err);
        const msg = err.error?.message || 'Failed to delete PRs';
        this.notify.showError(msg);
      },
    });
  }

  selectWorkout(workout:string) {
    this.searchBy = workout;
  }
  searchForPrSummary(){
    this.prPageNo = 0;
    this.loadSummary()
  }
  prPageNo: number = 0;
  prPageSize : number = 12
  prPageIsLast : boolean = false;
  prTotalPages = 0;
  prTotalElements = 0;
  // ====== SUMMARY (monthly status bars) ======
  loadSummary() {
    if (!this.searchBy || this.searchBy.trim().length === 0) {
      this.notify.showError('Enter a workout name in search to load summary.');
      return;
    }

    const from = this.fromDate ? new Date(this.fromDate) : undefined;
    const to = this.toDate ? new Date(this.toDate) : undefined;

    this.loader.show('Loading summary', faDownload);

   
    this.member
      .getAllPrSummary(
        this.memberId,
        this.prPageNo,
        this.prPageSize,
        this.searchBy,
        this.sortDirection,
        from,
        to,
      )
      .subscribe({
        next: (res: PrSummaryList) => {
          console.log(res);
          this.summaryLoaded = true
          this.monthlySummaries = res.responseDtoList;
          this.prPageNo = res.pageNo;
          this.prPageIsLast = res.lastPage;
          this.prTotalElements = res.totalElements;
          this.prTotalPages = res.totalPages;
          this.loader.hide();
          this.notify.showSuccess('Summary loaded');
        },
        error: (err: HttpErrorResponse & { error: errorOutPutMessageModel }) => {
          this.loader.hide();
          const msg = err.error?.message || 'Failed to load summary';
          this.notify.showError(msg);
        },
      });
  }
toggleUnit(weight: number): number {
  if(this.selectedUnit === 'lb') return weight * 2.2;
  return weight;
}
  prevPagePrSummary(){
    this.prPageNo --;
    this.loadSummary();
  }
  nextPagePrSummary(){
    this.prPageNo ++;
    this.loadSummary()
  }
  monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  getWeightScale(value: number): number {
    if (!this.maxWeightInSummary) return 10;
    const ratio = value / this.maxWeightInSummary;
    return Math.max(8, Math.min(100, ratio * 100));
  }
}
