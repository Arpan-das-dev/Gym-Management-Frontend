export interface SessionsResponseDto {
  sessionId: string;
  sessionName: string;
  sessionStartTime: string;
  sessionEndTime: string;
  memberId: string;
  trainerId: string;
  sessionStatus: string;
}
export interface AllSessionInfoResponseDto {
  sessionsResponseDtoList: SessionsResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
export interface AddSessionRequestDto {
  memberId: string;
  sessionName: string;
  sessionDate: string;
  duration: number;
}
export interface AllSessionResponseDto {
  sessionId: string;
  memberId: string;
  sessionName: string;
  sessionStatus: string;
  sessionStartTime: Date | string; 
  sessionEndTime: Date | string;
}

export interface AllSessionsWrapperDto {
  responseDtoList: AllSessionResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface UpdateSessionRequestDto {
  trainerId: string;
  memberId: string;
  sessionName: string;
  sessionDate: Date | string; 
  duration: number;
}