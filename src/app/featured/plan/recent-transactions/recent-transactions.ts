import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheckCircle, faChevronDown,faChevronUp,faCogs,faExclamationCircle,faEye,faSearch,faSort} from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../../core/services/admin-service';
import { AllRecentTransactionsResponseWrapperDto, RecentTransactionsResponseDto } from '../../../core/Models/planModel';
import { Navbar } from "../../../shared/components/navbar/navbar";
import { erroResponseModel } from '../../../core/Models/errorResponseModel';
@Component({
  selector: 'app-recent-transactions',
  imports: [FormsModule, FontAwesomeModule, DatePipe, Navbar, NgClass],
  templateUrl: './recent-transactions.html',
  styleUrl: './recent-transactions.css',
})
export class RecentTransactions implements OnInit {
  icons = {
    search : faSearch,
    sort : faSort,
    up: faChevronUp,
    down: faChevronDown,
    // global fa icons
    cogs: faCogs,
    checkCircle: faCheckCircle,
    exclamationCircle : faExclamationCircle,
    eye : faEye
  }
  searchTerm: string = '';
  sortOption: string = 'date_desc';
  sortDirection: string = 'desc';
  pageNo : number = 0;
  pageSize : number = 20;
  totalPages : number = 0
  // global boolean and message variables for better ui and animations
   loading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  // global massage showing methods
  showFullScreenMessage(type: 'success' | 'error', text: string) {
    this.messageType = type;
    this.messageText = text;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
  transactions:TransactionWithToggle[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchTransactions();
  }

  fetchTransactions(){
    this.loading = true;
    this.adminService.getRecentTransactions(this.searchTerm,this.sortOption,this.sortDirection,this.pageNo,this.pageSize).subscribe({
      next:(res: AllRecentTransactionsResponseWrapperDto) =>{
        console.log(res);
        this.transactions = res.responseDtoList.map(t => ({ ...t, show: false }));
        this.pageNo = res.pageNo;
        this.pageSize = res.pageSize;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.showFullScreenMessage('success',"Fetched transactions successfully");
      },
      error:(err: erroResponseModel) =>{
        console.log(err);
        this.loading = false;
        this.showFullScreenMessage('error',"Failed to fetch transactions: "+err.message);
      }
    })
  }

  onSearch(){
    this.pageNo = 0;
    this.fetchTransactions();
  }
  onSort(){
    const [sortBy, direction] = this.sortOption.split('_');
    this.sortOption = sortBy;
    this.sortDirection = direction;
    this.pageNo = 0;
    this.fetchTransactions();
  }
}

export interface TransactionWithToggle extends RecentTransactionsResponseDto {
  show: boolean;
}