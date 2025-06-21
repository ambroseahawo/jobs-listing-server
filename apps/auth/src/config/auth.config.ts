import { registerAs } from "@nestjs/config";

export default registerAs("auth", () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    accessExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "15m",
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d",
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    userEventsQueue: process.env.USER_EVENTS_QUEUE,
  },
  enableIpBinding: process.env.ENABLE_IP_BINDING === "true",
  nodeEnv: process.env.NODE_ENV || "development",
}));

export interface AuthConfig {
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  rabbitmq: {
    url: string;
    userEventsQueue: string;
  };
  enableIpBinding: boolean;
  nodeEnv: string;
}
