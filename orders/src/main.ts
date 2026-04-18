import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Existing TCP for Gateway communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 6000 },
  });

  // 2. Add NATS Listener
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [(process.env.NATS_SERVERS ?? 'nats://localhost:4222')],
      queue: 'orders-service-queue' // Queue groups ensure only one instance handles the event
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
