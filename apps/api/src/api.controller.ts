import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiGatewayService } from "./api.service";

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  // Auth service endpoints via RabbitMQ
  @Post("auth/login")
  async login(@Body() loginData: any) {
    return this.apiGatewayService.sendToAuthAndWait("auth.login", loginData);
  }

  @Post("auth/register")
  async register(@Body() registerData: any) {
    return this.apiGatewayService.sendToAuthAndWait(
      "auth.register",
      registerData,
    );
  }

  @Post("auth/validate")
  async validateToken(@Body() tokenData: any) {
    return this.apiGatewayService.sendToAuthAndWait("auth.validate", tokenData);
  }

  @Post("auth/logout")
  async logout(@Headers("authorization") token: string) {
    return this.apiGatewayService.sendToAuthAndWait("auth.logout", { token });
  }

  // Users service endpoints via RabbitMQ
  @Get("users/profile")
  async getUserProfile(@Headers("authorization") token: string) {
    return this.apiGatewayService.sendToUsersAndWait("users.getProfile", {
      token,
    });
  }

  @Post("users/profile")
  async updateUserProfile(
    @Body() profileData: any,
    @Headers("authorization") token: string,
  ) {
    return this.apiGatewayService.sendToUsersAndWait("users.updateProfile", {
      ...profileData,
      token,
    });
  }

  @Get("users/:userId")
  async getUserById(
    @Headers("authorization") token: string,
    @Param("userId") userId: string,
  ) {
    return this.apiGatewayService.sendToUsersAndWait("users.getById", {
      token,
      userId,
    });
  }

  // Event-driven endpoints (fire and forget)
  @Post("events/user-created")
  async userCreated(@Body() userData: any) {
    return this.apiGatewayService.sendToUsers("users.created", userData);
  }

  @Post("events/user-updated")
  async userUpdated(@Body() userData: any) {
    return this.apiGatewayService.sendToUsers("users.updated", userData);
  }
}
