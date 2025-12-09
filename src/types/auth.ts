export interface User {
  id: number;
  email?: string; // Make email optional
  nickname: string;
  profileImageUrl: string | null;
  bio?: string;
  friendsCount: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  nickname: string;
}
