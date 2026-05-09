import { Injectable, Inject, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import Stripe from 'stripe';
import { Payment } from './schemas/payment.schema';
import { Order, OrderStatus } from './schemas/order.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) {}

  async syncOrder(data: any) {
    const { id, userId, price, status, expiresAt } = data;
    const order = new this.orderModel({ _id: id, userId, price, status, expiresAt });
    await order.save();
    this.logger.log(`Order ${id} synced`);
  }

  async cancelOrder(data: any) {
    const { id } = data;
    await this.orderModel.findByIdAndUpdate(id, { $set: { status: OrderStatus.Cancelled } });
    this.logger.log(`Order ${id} marked as cancelled`);
  }

  async createPayment(data: CreatePaymentDto) {
    const { orderId, token, userId } = data;

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new RpcException({ message: 'Order not found', status: HttpStatus.NOT_FOUND });
    }
    if (order.userId !== userId) {
      throw new RpcException({ message: 'Unauthorized', status: HttpStatus.UNAUTHORIZED });
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new RpcException({ message: 'Order is cancelled', status: HttpStatus.BAD_REQUEST });
    }

    const charge = await this.stripe.charges.create({
      amount: Math.round(order.price * 100),
      currency: 'usd',
      source: token,
      description: `Payment for order ${orderId}`,
    });

    const payment = new this.paymentModel({ orderId, stripeId: charge.id });
    await payment.save();

    this.natsClient.emit('payment:created', { orderId, stripeId: charge.id });
    this.logger.log(`Payment created for order ${orderId}, charge ${charge.id}`);

    return { id: payment.id, stripeId: charge.id };
  }
}
