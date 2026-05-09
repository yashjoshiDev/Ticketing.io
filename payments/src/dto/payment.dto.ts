import { IsMongoId, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  orderId: string;

  @IsString()
  token: string;

  @IsString()
  userId: string;
}
