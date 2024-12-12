export class CreateUserDto {
  name: string;
  email: number;
  password: string;
  otp?: string;
}

export class ValidateUserDto {
  email: string;
  password: string;
}
