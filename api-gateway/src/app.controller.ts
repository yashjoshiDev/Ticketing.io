import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupBodyDto, SigninBodyDto, CreateTicketBodyDto, CreateOrderBodyDto } from './dto/gateway.dto';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('TICKETS_SERVICE') private ticketsClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) { }

  @Post('api/users/signup')
  async signup(@Body() body: SignupBodyDto, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'signup' }, body),
    );
    if (result.token) {
      req.session = { jwt: result.token };
    }
    return result;
  }

  @Post('api/users/signin')
  async signin(@Body() body: SigninBodyDto, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'signin' }, body),
    );
    if (result.token) {
      req.session = { jwt: result.token };
    }
    return result;
  }

  @Post('api/users/signout')
  signout(@Req() req: Request) {
    req.session = null;
    return {};
  }

  @Get('api/users/currentuser')
  currentUser(@Req() req: Request) {
    return this.authClient.send(
      { cmd: 'currentuser' },
      { token: req.session?.jwt },
    );
  }

  @Get('api/tickets')
  getTickets() {
    return this.ticketsClient.send({ cmd: 'get_tickets' }, {});
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/tickets')
  async createTicket(@Body() body: CreateTicketBodyDto, @Req() req: Request) {
    const currentUser = (req as any).currentUser;
    return this.ticketsClient.send(
      { cmd: 'create_ticket' },
      { ...body, userId: currentUser?.currentUser?.id || 'guest' },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/orders')
  async getOrders(@Req() req: Request) {
    const currentUser = (req as any).currentUser;
    return this.ordersClient.send(
      { cmd: 'get_orders' },
      { userId: currentUser?.currentUser?.id },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/orders')
  async createOrder(@Body() body: CreateOrderBodyDto, @Req() req: Request) {
    const currentUser = (req as any).currentUser;
    return this.ordersClient.send(
      { cmd: 'create_order' },
      { ...body, userId: currentUser?.currentUser?.id },
    );
  }
}
