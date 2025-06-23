import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from "@nestjs/throttler";

import { validate } from "@config/env.validation";

import { AuthModule } from "@modules/auth/auth.module";
import { DatabaseModule } from "@modules/database/database.module";
import { SessionModule } from "@modules/session/session.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: Number(configService.getOrThrow("UPLOAD_RATE_TTL")),
            limit: Number(configService.getOrThrow("UPLOAD_RATE_LIMIT")),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    SessionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
