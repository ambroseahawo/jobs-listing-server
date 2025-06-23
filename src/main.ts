require("module-alias/register");

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";

import { AllExceptionsFilter } from "@common/global-filters/all-exceptions.filter";
import { AppModule } from "@src/app.module";
// import { runMigrations } from "@src/migrations/migration-runner";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api/v1");
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<string>("APP_PORT");

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, configService));

  // await runMigrations();
  await app.listen(port as string);
}
bootstrap().catch((err) => {
  console.log("Error during app bootstrap: ", err);
  process.exit(1);
});
