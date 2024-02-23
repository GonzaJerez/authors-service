import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

export async function httpServer() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  await app.listen(config.get('HTTP_PORT'));
}
