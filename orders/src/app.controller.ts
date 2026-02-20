import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
}
