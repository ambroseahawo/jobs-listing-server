import { Injectable } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Injectable()
export class UsersService {
  // Message patterns for RabbitMQ communication
  @MessagePattern("users.getProfile")
  async getProfile(@Payload() data: { token: string }) {
    // Validate JWT token and return user profile
    return { message: "Get user profile", token: data.token };
  }

  @MessagePattern("users.updateProfile")
  async updateProfile(@Payload() data: { token: string; profile: any }) {
    // Validate JWT token and update user profile
    return {
      message: "Update user profile",
      token: data.token,
      profile: data.profile,
    };
  }

  @MessagePattern("users.getById")
  async getById(@Payload() data: { token: string; userId: string }) {
    // Validate JWT token and return user by ID
    return {
      message: "Get user by ID",
      token: data.token,
      userId: data.userId,
    };
  }

  @MessagePattern("users.created")
  async userCreated(@Payload() data: any) {
    // Handle user created event (fire and forget)
    console.log("User created event received:", data);
    return { message: "User created event processed" };
  }

  @MessagePattern("users.updated")
  async userUpdated(@Payload() data: any) {
    // Handle user updated event (fire and forget)
    console.log("User updated event received:", data);
    return { message: "User updated event processed" };
  }

  getHello(): string {
    return "Users service (RabbitMQ) is running!";
  }
}
