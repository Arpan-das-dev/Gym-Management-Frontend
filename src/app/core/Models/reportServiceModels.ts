export interface ReportOrMessageCreationRequestDto {
  subject: string;
  userId: string;
  userRole: string;
  userName: string;
  emailId: string;
  message: string;
  messageTime: string;
}
export interface AllReportsList {
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  message: string;
  messageTime: string; 
  messageStatus: string;
}

export interface AllMessageWrapperResponseDto {
  reportsLists: AllReportsList[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}