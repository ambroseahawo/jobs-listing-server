import { RmqModule } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiGatewayController } from "./api.controller";
import { ApiGatewayService } from "./api.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RmqModule.register({ name: "AUTH" }),
    RmqModule.register({ name: "USERS" }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
