export interface BaseResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

export interface UserInfo {
  _id: string;
  email: string;
  name: string;
  role: string;
  accessToken?: string;
  avatar?: string;
  wishlist?: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}
