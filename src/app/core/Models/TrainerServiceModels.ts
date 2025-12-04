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
