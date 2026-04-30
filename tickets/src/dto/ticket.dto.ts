import { IsString, IsNumber, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  userId: string;
}
