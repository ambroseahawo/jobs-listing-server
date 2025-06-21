import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "@app/auth/auth.controller";
import { AuthService } from "@app/auth/auth.service";
import authConfig from "@app/auth/config/auth.config";
import { RedisModule } from "@app/auth/redis/redis.module";
import { validate } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      validationSchema: validate,
      envFilePath: "./apps/auth/.env",
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("auth.jwt.accessSecret"), // Use the correct path
        signOptions: {
          expiresIn: configService.get<string>("auth.jwt.accessExpiry"),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
