import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieSession = require('cookie-session');
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/rpc-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    cookieSession({
      signed: true,
      keys: [process.env.COOKIE_SECRET ?? 'dev-cookie-secret'],
      secure: isProd,       // HTTPS only in production
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-origin cookies (Vercel → EC2/tunnel)
    })
  );
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Ticketing.io API')
    .setDescription('The main entry point for Ticketing Microservices')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Add the Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
