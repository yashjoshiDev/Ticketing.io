import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { port: 4000 },
      },
      {
        name: 'TICKETS_SERVICE',
        transport: Transport.TCP,
        options: { port: 5000 },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: { port: 6000 },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
