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

export class AddRequestDto{
  userId:string;
  requestUserId:string;
}
export class AcceptRequestDto{
  userId:string;
  acceptUserId:string;
}
export class RejectRequestDto{
  userId:string;
  rejectUserId:string;
}
