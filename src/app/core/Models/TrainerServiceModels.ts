export interface PublicTrainerInfoResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  averageRating: number;
}
export interface AllPublicTrainerInfoResponseWrapperDto {
  responseDtoList: PublicTrainerInfoResponseDto[];
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

