import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'create_ticket' })
  async createTicket(@Payload() data: any) {
    return this.appService.createTicket(data);
  }

  @MessagePattern({ cmd: 'get_tickets' })
  async getTickets() {
    return this.appService.getTickets();
  }
}
