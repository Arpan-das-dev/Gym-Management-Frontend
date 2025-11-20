export interface plansResponseModel {
  planId: string;
  planName: string;
  price: number;
  duration: number;
  planFeatures: string[];
}

export interface PlanCreateRequestDto {
  /** Plan name is required */
  planName: string;

  /** Price is required and must be greater than 0 */
  price: string;

  /** Duration is required and must be at least 1 */
  duration: number;

  /** Features list cannot be null and must have at least one non-blank feature */
  features: string[];
}

export interface PlanPaymentRequestDto {
  userName: string;
  userId: string;
  userMail: string;
  planId: string;
  currency: string;
  amount: number;
  cuponCode: string;
  paymentDate: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface AllMonthlyRevenueWrapper {
  reviewResponseDtoList: MonthlyReviewResponseDto[];
}

export interface MonthlyReviewResponseDto {
  month: string;
  revenue: number;
  change: number;
}

export interface MonthlyRevenueResponseDto {
  currentMonthReview: number;
  changeInPercentage: number;
}

export interface TotalUserResponseDto {
  totalActiveUsers: number;
  userChange: number;
}

export interface PlanUpdateRequestDto {
  id: string
  planName: string;
  price: number;
  duration: number;
  features: string[];
}

export interface UpdateResponseDto {
  id: string;
  planName: string;
  price: number;
  duration: number;
  features: string[];
}

export interface AllRecentTransactionsResponseWrapperDto {
  responseDtoList: RecentTransactionsResponseDto[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface RecentTransactionsResponseDto {
  paymentId: string;
  orderId: string;
  userName: string;
  userId: string;
  planName: string;
  planId: string;
  paidPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentTime: string; 
  paymentDate: string;
  receiptUrl: string;
}
