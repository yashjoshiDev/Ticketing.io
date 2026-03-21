import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>) { }

  async createTicket(data: any) {
    const { title, price, userId } = data;
    const ticket = new this.ticketModel({ title, price, userId });
    await ticket.save();

    this.natsClient.emit('ticket:created', {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return ticket;
  }

  async getTickets() {
    return await this.ticketModel.find({});
  }

  async updateTicket(id: string, data: any) {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!ticket) {
      throw new RpcException({ message: 'Ticket not found', status: 404 });
    }

    // 📢 Emit the update event to NATS
    this.natsClient.emit('ticket:updated', {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version, // Useful for concurrency control later
    });

    return ticket;
  }
}
