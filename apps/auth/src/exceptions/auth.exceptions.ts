import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super("Invalid credentials", HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedException extends HttpException {
  constructor() {
    super("Unauthorized", HttpStatus.UNAUTHORIZED);
  }
}
export class BadRequestException extends HttpException {
  constructor() {
    super("Bad Request", HttpStatus.BAD_REQUEST);
  }
}
