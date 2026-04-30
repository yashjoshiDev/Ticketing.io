import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { Ticket } from './schemas/ticket.schema';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
  ) { }

  async onModuleInit() {
    // Seed a ticket if none exist
    const count = await this.ticketModel.countDocuments();
    if (count === 0) {
      await new this.ticketModel({ title: 'Test Concert', price: 20 }).save();
    }
  }

  async getOrders(userId: string) {
    return await this.orderModel.find({ userId }).populate('ticket');
  }

  async createOrder(data: CreateOrderDto) {
    const { ticketId, userId } = data;

    // 1. Find the ticket
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new RpcException({
        message: 'Ticket not found',
        status: HttpStatus.NOT_FOUND
      });
    }

    // 2. Check if ticket is reserved (Simplified for now)
    const existingOrder = await this.orderModel.findOne({
      ticket: ticket._id,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });

    if (existingOrder) {
      throw new RpcException({
        message: 'Ticket is already reserved',
        status: HttpStatus.BAD_REQUEST
      });
    }

    // 3. Set expiration (15 mins)
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + 15 * 60);

    // 4. Build and save the order
    const order = new this.orderModel({
      userId,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();

    return order;
  }

  async syncTicket(data: any) {
    const { id, title, price } = data;

    const ticket = new this.ticketModel({
      _id: id, // Use the same ID from the Tickets service
      title,
      price,
    });

    await ticket.save();
    this.logger.log('Shadow ticket synced');
  }

  async updateSyncedTicket(data: any) {
    const { id, title, price, version } = data;

    // Find the ticket that matches the ID AND has the PREVIOUS version
    const ticket = await this.ticketModel.findOneAndUpdate(
      {
        _id: id,
        version: version - 1 // Logic: Only update if we aren't skipping a version
      },
      { $set: { title, price } },
      { new: true }
    );

    if (!ticket) {
      // If no ticket found, it means this message arrived out of order 
      // or we missed a previous message.
      throw new RpcException({ status: 409, message: 'Inconsistent ticket version received' });
    }
  }
}
