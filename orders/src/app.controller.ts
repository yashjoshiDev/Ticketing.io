import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: CreateOrderDto) {
    return this.appService.createOrder(data);
  }

  @MessagePattern({ cmd: 'get_orders' })
  async getOrders(@Payload() data: any) {
    return this.appService.getOrders(data.userId);
  }

  @EventPattern('ticket:created')
  async handleTicketCreated(@Payload() data: any) {
    this.logger.log('Received ticket:created event');
    await this.appService.syncTicket(data);
  }

  @EventPattern('ticket:updated')
  async handleTicketUpdated(@Payload() data: any) {
    this.logger.log('Received ticket:updated event');
    await this.appService.updateSyncedTicket(data);
  }
}
