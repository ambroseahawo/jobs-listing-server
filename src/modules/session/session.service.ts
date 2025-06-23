import { RedisClientType } from "redis";

import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class SessionService {
  constructor(
    @Inject("REDIS_CLIENT") private readonly redis: RedisClientType,
  ) {}

  async createSession(
    userId: string,
    token: string,
    payload: Record<string, any>,
    ttlSeconds: number,
  ) {
    await this.redis.set(
      `session:${userId}:${token}`,
      JSON.stringify(payload),
      {
        EX: ttlSeconds,
      },
    );
  }

  async invalidateSession(userId: string, token: string) {
    await this.redis.del(`session:${userId}:${token}`);
  }

  async getSession(userId: string, token: string) {
    const data = await this.redis.get(`session:${userId}:${token}`);
    return data ? JSON.parse(data) : null;
  }

  async invalidateAllSessions(userId: string) {
    const pattern = `session:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}
