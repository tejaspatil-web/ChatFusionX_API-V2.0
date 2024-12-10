export class CreateUserDto {
  name: string;
  email: number;
  password: string;
}

export class ValidateUserDto {
  email: string;
  password: string;
}
