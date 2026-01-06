import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';

import { AppModule } from './app.module';

const parseAllowedOrigins = (value?: string): true | string[] => {
  if (!value) {
    return true;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : true;
};

const configureApp = (app: INestApplication): void => {
  app.enableCors({
    origin: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
    methods: ['GET'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

export const createApp = async (
  expressInstance?: Express,
): Promise<INestApplication> => {
  const app = expressInstance
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressInstance))
    : await NestFactory.create(AppModule);

  configureApp(app);

  if (expressInstance) {
    await app.init();
  }

  return app;
};
