export interface ApprovalRequestDto {
  email: string;
  phone: string;
  name: string;
  role: string;       // Role represented as a plain string
  joinDate: string;   // Date as ISO string
}

export interface ApprovalResponseDto{
    email:string;
    approval:boolean;
}
export interface PendingRequestResponseDto {
  requestId: string;
  email: string;
  phone: string;
  name: string;
  role: string;           // Using string for role here, adjust if you have a RoleType interface/enum
  joinDate: string;       // ISO date string format representing LocalDate
}

export interface AllPendingRequestResponseWrapperDto {
  responseDtoList: PendingRequestResponseDto[];
}

export interface MemberRequestResponse {
  requestId: string;
  memberId: string;
  memberProfileImageUrl: string;
  memberName: string;
  trainerId: string;
  trainerProfileImageUrl: string;
  trainerName: string;
  requestDate: string;           // ISO date string representing LocalDate
  memberPlanName: string;
  memberPlanExpirationDate: string; // ISO date string
}

export interface AllMemberRequestDtoList {
  requestDtoList: MemberRequestResponse[];
}

export interface TrainerAssignmentResponseDto {
  trainerId: string;
  trainerName: string;
  trainerProfileImageUrl: string;
  eligibilityEnd: string;  // ISO date string representing LocalDate
  memberId: string;
}

