export interface plansResponseModel {
  /**
   * Unique identifier of the plan.
   * Example: "BASIC_2026"
   */
  planId: string;

  /**
   * Human-readable name of the plan.
   * Example: "Basic Plan"
   */
  planName: string;

  /**
   * Price of the plan in the applicable currency.
   * Represented as a Double value.
   */
  price: number;

  /**
   * Duration of the plan in days.
   * Example: 365 for a yearly plan.
   */
  duration: number;

  /**
   * List of features included in the plan.
   * Each feature is represented as a String.
   */
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
