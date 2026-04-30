import { IsEmail, IsString, MinLength, IsNumber, IsPositive, IsMongoId, MaxLength } from 'class-validator';

export class SignupBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SigninBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateTicketBodyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateOrderBodyDto {
  @IsMongoId()
  ticketId: string;
}
