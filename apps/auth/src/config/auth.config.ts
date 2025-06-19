import { registerAs } from "@nestjs/config";

export default registerAs("auth", () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: "15m",
    refreshExpiry: "7d",
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    userEventsQueue: "user_events",
  },
}));
