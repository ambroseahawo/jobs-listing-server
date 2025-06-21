import { LoginDto } from "@app/auth/dto/auth.dto";
import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    await this.authService.login(loginDto, req, res);
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.refreshSession(req, res);
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req, res);
  }
  @Post("logout-all")
  async logoutAllDevices(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAllDevices(req, res);
  }
}
