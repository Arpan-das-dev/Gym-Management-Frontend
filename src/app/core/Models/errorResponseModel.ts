export interface erroResponseModel {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface errorOutPutMessageModel {
  message: string;
  status: number;
}
