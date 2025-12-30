export interface publicTrainerInfoResponseDtoList {
  id: string;
  firstName: string;
  lastName: string;
  about: string;
  clientCount: number;
  email: string;
  gender: string;
  averageRating: number;
  profileImageUrl: string;
  reviewCount: number;
  specialities: string[];
  showAll: boolean;
}

export interface AllPublicTrainerInfoResponseWrapperDto {
  publicTrainerInfoResponseDtoList: publicTrainerInfoResponseDtoList[];
}
export interface TrainerResponseDto {
  trainerId: string;
  trainerProfileImageUrl: string;
  firstName: string;
  lastName: string;
  emailId: string;
  phone: string;
  gender: string;
  lastLoginTime: string;
  available: boolean;
  averageRating: number;
}
export interface SpecialityResponseDto {
  specialityList: string[];
}
export interface TrainerAssignRequestDto {
  memberId: string;
  trainerId: string;
  trainerName: string;
  trainerProfileImageUrl: string;
  requestDate: string;
}
export interface TrainerDashBoardInfoResponseDto {
  clientMatrixInfo: ClientMatrixInfo;
  sessionMatrixInfo: SessionMatrixInfo;
  ratingMatrixInfo: RatingMatrixInfo;
}
export interface ClientMatrixInfo {
  currentMonthClientCount: number;
  previousMonthClientCount: number;
  change: number;
}
export interface SessionMatrixInfo {
  totalSessionsThisWeek: number;
  totalSessionsLeft: number;
}
export interface RatingMatrixInfo {
  currentRating: number;
  oldRating: number;
  change: number;
}

export interface MemberResponseDto {
  memberId: string;
  trainerId: string;
  memberName: string;
  memberProfileImageUrl: string;
  eligibilityEnd: string;
}
export interface AllMemberResponseWrapperDto {
  memberResponseDtoList: MemberResponseDto[];
}
export interface ReviewAddRequestDto {
  userId: string;
  userName: string;
  userRole: string;
  reviewDate: string;
  comment: string;
  review: number;
}
export interface ReviewResponseDto {
  reviewId: string;
  userId: string;
  userName: string;
  userRole: string;
  reviewDate: string;
  comment: string;
  review: number;
}
export interface AllReviewResponseWrapperDto {
  reviewResponseDtoList: ReviewResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
export interface ReviewUpdateRequestDto {
  userId: string;
  userName: string;
  userRole: string;
  trainerId: string;
  reviewDate: string;
  comment: string;
  review: number;
}

export interface AllTrainerResponseDto {
  id: string;
  imageUrl: string;
  firstName: string;
  lastName: string;
  about: string;
  email: string;
  phone: string;
  gender: string;
  frozen: boolean;
  averageRating: number;
  clientCount : number;
  lastLoginTime: string;
  show:boolean;
  clientViewMode: boolean
}
export interface AllTrainerResponseDtoWrapper {
  allTrainerResponseDtoWrappers: AllTrainerResponseDto[];
}
