import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreatePaymentDto } from './dto/payment.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create_payment' })
  async createPayment(@Payload() data: CreatePaymentDto) {
    return this.appService.createPayment(data);
  }

  @EventPattern('order:created')
  async handleOrderCreated(@Payload() data: any) {
    this.logger.log('Received order:created event');
    await this.appService.syncOrder(data);
  }

  @EventPattern('order:cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    this.logger.log('Received order:cancelled event');
    await this.appService.cancelOrder(data);
  }
}
