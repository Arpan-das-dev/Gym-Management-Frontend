export interface CuponValidationResponse{
    valid:boolean;
    offPercentage: number;
}
export interface CreateCuponCodeRequestDto {
  cuponCode: string;
  validity: string;
  offPercentage: number;
}
