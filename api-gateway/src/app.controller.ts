import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('TICKETS_SERVICE') private ticketsClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) { }

  @Post('api/users/signup')
  async signup(@Body() body: any, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'signup' }, body),
    );
    if (result.token) {
      req.session = { jwt: result.token };
    }
    return result;
  }

  @Post('api/users/signin')
  async signin(@Body() body: any, @Req() req: Request) {
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

  @Post('api/tickets')
  async createTicket(@Body() body: any, @Req() req: Request) {
    const userResult = await firstValueFrom(
      this.authClient.send({ cmd: 'currentuser' }, { token: req.session?.jwt }),
    );

    return this.ticketsClient.send(
      { cmd: 'create_ticket' },
      { ...body, userId: userResult.currentUser?.id || 'guest' },
    );
  }

  @Get('api/orders')
  async getOrders(@Req() req: Request) {
    const userResult = await firstValueFrom(
      this.authClient.send({ cmd: 'currentuser' }, { token: req.session?.jwt }),
    );

    return this.ordersClient.send(
      { cmd: 'get_orders' },
      { userId: userResult.currentUser?.id },
    );
  }

  @Post('api/orders')
  async createOrder(@Body() body: any, @Req() req: Request) {
    const userResult = await firstValueFrom(
      this.authClient.send({ cmd: 'currentuser' }, { token: req.session?.jwt }),
    );

    return this.ordersClient.send(
      { cmd: 'create_order' },
      { ...body, userId: userResult.currentUser?.id },
    );
  }
}
