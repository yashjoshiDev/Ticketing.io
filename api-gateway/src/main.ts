import { NestFactory } from '@nestjs/core';
import cookieSession = require('cookie-session');
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/rpc-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cookieSession({
      signed: false,
      secure: false, // Set to true in production
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ticketing.io API')
    .setDescription('The main entry point for Ticketing Microservices')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Add the Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
