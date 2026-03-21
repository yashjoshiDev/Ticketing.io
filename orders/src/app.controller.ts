import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: any) {
    return this.appService.createOrder(data);
  }

  @MessagePattern({ cmd: 'get_orders' })
  async getOrders(@Payload() data: any) {
    return this.appService.getOrders(data.userId);
  }

  @EventPattern('ticket:created')
  async handleTicketCreated(@Payload() data: any) {
    console.log('📦 Orders Service received Ticket Created event:', data);
    await this.appService.syncTicket(data);
  }

  @EventPattern('ticket:updated')
  async handleTicketUpdated(@Payload() data: any) {
    console.log('🔄 Orders Service received Ticket Updated event:', data);
    await this.appService.updateSyncedTicket(data);
  }
}
