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
  requestId : string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  message: string;
  messageTime: string; 
  messageStatus: string;
  show:boolean
}

export interface AllMessageWrapperResponseDto {
  reportsLists: AllReportsList[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface ResolveMessageRequestDto {
    requestId :string| null;
    notify :boolean;
    mailMessage :string| null;
    decline :boolean;
}