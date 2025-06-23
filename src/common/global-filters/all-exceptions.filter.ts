import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost } from "@nestjs/core";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Ensure proper handling of HttpException (409, 400, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse(); // NestJS returns object with `message`
      const isProduction =
        this.configService.get<string>("NODE_ENV") === "production";

      this.logger.error(
        `Exception: ${JSON.stringify(message)}, status: ${status}`,
      );

      response.status(status).json(
        isProduction
          ? {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: message["message"] || message,
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: message["message"] || message,
              stacktrace: exception.stack,
            },
      );

      return; // Prevent fallback to 500
    }

    // Handle unknown/unexpected errors (500)
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      `Unhandled Exception: ${exception.message}, stack: ${exception.stack}`,
    );

    const responseBody = {
      statusCode: httpStatus,
      message: "Internal Server error",
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
