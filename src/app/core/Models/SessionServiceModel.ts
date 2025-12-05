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
