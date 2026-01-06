import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
  }
  
  await app.getHttpAdapter().getInstance().handle(req, res, () => {});
}
