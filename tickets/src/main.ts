import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Keep TCP for Gateway requests
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 5000 },
  });

  // 2. Add NATS for Event Publishing
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { servers: ['nats://localhost:4222'] },
  });

  await app.startAllMicroservices();
  await app.listen(3001); // Internal HTTP for health checks if needed
}
bootstrap();
