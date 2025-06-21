import { RmqService } from "@app/common";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { RmqOptions } from "@nestjs/microservices";

import { AuthModule } from "@app/auth/auth.module";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice<RmqOptions>(rmqService.getOptions("AUTH", true));
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  const port = configService.get<number>("PORT")!;

  await app.listen(port);
}
bootstrap();
