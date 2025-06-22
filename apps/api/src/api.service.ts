import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject("AUTH") private readonly authClient: ClientProxy,
    @Inject("USERS") private readonly usersClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  // Route messages to auth service via RabbitMQ
  async sendToAuth(pattern: string, data: any) {
    return this.authClient.emit(pattern, data);
  }

  // Route messages to users service via RabbitMQ
  async sendToUsers(pattern: string, data: any) {
    return this.usersClient.emit(pattern, data);
  }

  // Send and wait for response from auth service
  async sendToAuthAndWait(pattern: string, data: any) {
    return this.authClient.send(pattern, data);
  }

  // Send and wait for response from users service
  async sendToUsersAndWait(pattern: string, data: any) {
    return this.usersClient.send(pattern, data);
  }

  getHello(): string {
    return "API Gateway (RabbitMQ) is running!";
  }
}
