import { IsString, IsMongoId } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  ticketId: string;

  @IsString()
  userId: string;
}
