import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.AUTH_HOST ?? 'localhost', port: 4000 },
      },
      {
        name: 'TICKETS_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.TICKETS_HOST ?? 'localhost', port: 5000 },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.ORDERS_HOST ?? 'localhost', port: 6000 },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
