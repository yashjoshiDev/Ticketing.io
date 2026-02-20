import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) { }

  async createTicket(data: any) {
    const { title, price, userId } = data;
    const ticket = new this.ticketModel({ title, price, userId });
    return await ticket.save();
  }

  async getTickets() {
    return await this.ticketModel.find({});
  }
}
