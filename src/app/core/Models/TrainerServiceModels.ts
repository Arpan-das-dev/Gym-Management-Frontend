export interface PublicTrainerInfoResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  about: string;
  clientCount: number;
  email: string;
  gender: string;
  averageRating: number;
  profileImageUrl : string;
  reviewCount : number;
  specialities : string[]
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
export interface SpecialityResponseDto {
     specialityList: string[];
}
