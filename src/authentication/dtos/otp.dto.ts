export class sendEmailDto {
  email: string;
  userName: string;
}

export class verifyOtpDto {
  userName: string;
  email: string;
  otp: string;
}
export class resetPasswordDto {
  userName?: string;
  email: string;
  password?:string
}
