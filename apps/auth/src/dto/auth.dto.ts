export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayloadDto {
  sub: string;
  iat: number;
  exp: number;
}
