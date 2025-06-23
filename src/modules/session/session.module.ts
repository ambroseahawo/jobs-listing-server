import { createClient } from "redis";

import { Global, Module } from "@nestjs/common";

import { SessionService } from "@modules/session/session.service";

@Global()
@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL,
          socket:
            process.env.NODE_ENV === "production"
              ? {
                  tls: true,
                  host: process.env.REDIS_HOST!,
                  rejectUnauthorized: false,
                }
              : undefined,
        });
        await client.connect();
        return client;
      },
    },
    SessionService,
  ],
  exports: ["REDIS_CLIENT", SessionService],
})
export class SessionModule {}
