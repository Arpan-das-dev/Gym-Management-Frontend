// member mangement related models will go here
export interface FreezeRequestDto {
  id: string;
  freeze: boolean;
}
export interface AllMemberListResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  planExpiration: string | null; // ISO string from backend
  frozen: boolean;
  planDurationLeft: number;
  planName: string;
  planId?: string;
  profileImageUrl: string;
  active: boolean;
}

export interface AllMembersInfoWrapperResponseDtoList {
  responseDtoList: AllMemberListResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
export interface LoginStreakResponseDto {
  logInStreak: number;
  maxLogInStreak: number;
}
export interface MemberInfoResponseDto {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  frozen: boolean;
}
export interface MemberPlanInfoResponseDto {
  planExpiration: string;
  planId: string;
  planName: string;
  planDurationLeft: number;
}

export interface MemberWeighBmiEntryResponseDto {
  date: string;
  bmi: number;
  weight: number;
}
export interface allWeightBmiEntries {
  bmiEntryResponseDtoList: MemberWeighBmiEntryResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
export interface MonthlySummary {
  avgBmi: number;
  minBmi: number;
  maxBmi: number;
  avgWeight: number;
  minWeight: number;
  maxWeight: number;
  entryCount: number;
}

export interface MonthlySummaryList {
  summaryResponseDtoList: MonthlySummary[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
