import { NestFactory } from '@nestjs/core';
import cookieSession = require('cookie-session');
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/rpc-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      signed: false,
      secure: false, // Set to true in production
    }),
  );
  // Add the Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
