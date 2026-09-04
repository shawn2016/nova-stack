import { ApiResponse, ErrorCode } from '@nova/shared-types';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiResponse<null> = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
      data: null,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const payload = exceptionResponse as Record<string, unknown>;
        const rawMessage = payload.message;

        if (Array.isArray(rawMessage)) {
          body = {
            code: ErrorCode.BAD_REQUEST,
            message: 'Validation failed',
            data: { errors: rawMessage } as unknown as null,
          };
        } else {
          body = {
            code: (payload.code as number) ?? this.mapStatusToCode(status),
            message: (rawMessage as string) ?? exception.message,
            data: (payload.data as null) ?? null,
          };
        }
      } else {
        body = {
          code: this.mapStatusToCode(status),
          message: String(exceptionResponse),
          data: null,
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json(body);
  }

  private mapStatusToCode(status: number): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      default:
        return status >= 500 ? ErrorCode.INTERNAL_ERROR : status;
    }
  }
}
