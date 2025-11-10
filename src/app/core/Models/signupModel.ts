export interface signupModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  role: string;
  joinDate: string;
}

export interface userDetailModel {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  role: string; 
  joinDate: string; 
  emailVerified: boolean;
  phoneVerified: boolean;
  isApproved: boolean;
}

export interface createTrainerModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  role: string;
  joinDate: string;
  specialties: string[];
  experience: number;
}
