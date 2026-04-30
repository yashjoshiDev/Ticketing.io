import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateTicketDto } from './dto/ticket.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'create_ticket' })
  async createTicket(@Payload() data: CreateTicketDto) {
    return this.appService.createTicket(data);
  }

  @MessagePattern({ cmd: 'get_tickets' })
  async getTickets(@Payload() data: any) {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 20;
    return this.appService.getTickets(page, limit);
  }
}
