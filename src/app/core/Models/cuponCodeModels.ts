export interface CuponValidationResponse {
  valid: boolean;
  offPercentage: number;
}
export interface CreateCuponCodeRequestDto {
  cuponCode: string;
  validFrom: string;
  validity: string;
  offPercentage: number;
  access: string;
  description: string;
}

export interface UpdateCuponRequestDto {
  planId: string;
  validFrom: string;
  validity: string;
  offPercentage: number;
  access: string;
  description: string;
}

export interface CuponCodeResponseDto {
  cuponCode: string;
  planId: string;
  planName: string;
  access: string;
  validFrom: string;
  validityDate: string;
  users: number;
  offPercentage: number;
  description: string;
}



