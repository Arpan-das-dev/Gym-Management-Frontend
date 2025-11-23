// member mangement related models will go here
export interface FreezeRequestDto{
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
  profileImageUrl: string 
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
    loginStreak: number;
    maxLoginStreak: number;
}