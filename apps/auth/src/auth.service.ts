import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { Request, Response } from "express";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { PrismaClient } from "@prisma/client";

import { LoginDto } from "@app/auth/dto/auth.dto";
import {
  BadRequestException,
  InvalidCredentialsException,
  UnauthorizedException,
} from "@app/auth/exceptions/auth.exceptions";
import { RedisService } from "@app/auth/redis/redis.service";

@Injectable()
export class AuthService {
  private readonly jwtConfig: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  private readonly enableIpBinding: boolean;
  private readonly nodeEnv: string;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = this.configService.get("auth.jwt")!;
    this.enableIpBinding = this.configService.get("auth.enableIpBinding")!;
    this.nodeEnv = this.configService.get("auth.nodeEnv")!;
  }

  async login(loginDto: LoginDto, req: Request, res: Response) {
    const ip = req.ip;
    if (!ip) throw new BadRequestException();

    const userAgent = req.headers["user-agent"];
    if (!userAgent) throw new BadRequestException();

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new InvalidCredentialsException();

    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    await this.createSession(user.Id, refreshToken, ip, userAgent);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user };
  }

  async refreshSession(req: Request, res: Response) {
    const ip = req.ip;
    if (!ip) throw new UnauthorizedException();

    const userAgent = req.headers["user-agent"];
    if (!userAgent) throw new UnauthorizedException();

    const refreshToken = this.extractCookie(req, "refresh_token");
    if (!refreshToken) throw new UnauthorizedException(); // refresh token not found

    const payload = this.jwtService.verify(refreshToken, {
      secret: this.jwtConfig.refreshSecret,
    });
    const isValid = await this.validateRefreshToken(
      payload.sub,
      refreshToken,
      ip,
      userAgent,
    );
    if (!isValid) throw new UnauthorizedException();

    // Token rotation: issue new refresh token, invalidate old session
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload.sub);
    await this.invalidateSession(payload.sub, refreshToken);
    await this.createSession(payload.sub, newRefreshToken, ip, userAgent);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: this.nodeEnv === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { userId: payload.sub };
  }

  async logout(req: Request, res: Response) {
    const refreshToken = this.extractCookie(req, "refresh_token");
    if (!refreshToken) {
      throw new UnauthorizedException(); // refresh token not found
    }
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.jwtConfig.refreshSecret,
    });
    await this.invalidateSession(payload.sub, refreshToken);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return { message: "Logged out successfully" };
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.jwtConfig.accessSecret,
        expiresIn: this.jwtConfig.accessExpiry,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, tokenId: crypto.randomBytes(16).toString("hex") },
      {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig.refreshExpiry,
      },
    );

    return { accessToken, refreshToken };
  }

  async createSession(
    userId: string,
    refreshToken: string,
    ip: string,
    userAgent: string,
  ) {
    await this.redisService.createSession(
      userId,
      refreshToken,
      {
        ip,
        userAgent,
        valid: true,
      },
      60 * 60 * 24 * 7, // 7 days
    );
  }

  async validateUser(email: string, loginPassword: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(loginPassword, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ) {
    const session = await this.redisService.getSession(userId, refreshToken);
    if (!session || !session.valid) return false;
    // Device/IP binding (optional)
    if (this.enableIpBinding && ip && session.ip !== ip) return false;
    if (userAgent && session.userAgent !== userAgent) return false;
    // Brute-force/replay mitigation: add logging/alerting here if needed
    return true;
  }

  async invalidateSession(userId: string, refreshToken: string) {
    await this.redisService.invalidateSession(userId, refreshToken);
  }

  private extractCookie(req: Request, cookieName: string): string | undefined {
    return req.cookies?.[cookieName];
  }

  async logoutAllDevices(req: Request, res: Response) {
    const ip = req.ip;
    if (!ip) throw new UnauthorizedException();

    const userAgent = req.headers["user-agent"];
    if (!userAgent) throw new UnauthorizedException();

    const refreshToken = this.extractCookie(req, "refresh_token");
    if (!refreshToken) throw new UnauthorizedException(); // refresh token not found

    const payload = this.jwtService.verify(refreshToken, {
      secret: this.jwtConfig.refreshSecret,
    });
    const isValid = await this.validateRefreshToken(
      payload.sub,
      refreshToken,
      ip,
      userAgent,
    );
    if (!isValid) throw new UnauthorizedException();

    await this.redisService.invalidateAllSessions(payload.sub);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return { message: "Logged out from all devices" };
  }
}
