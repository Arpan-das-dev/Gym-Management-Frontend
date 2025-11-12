export interface CuponValidationResponse{
    valid:boolean;
    offPercentage: number;
}
export interface CreateCuponCodeRequestDto {
  cuponCode: string;
  validFrom: string;
  validity: string;
  offPercentage: number;
  access: string;
  description : string
}
