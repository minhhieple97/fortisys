import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errorCode = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
        details = (exceptionResponse as any).errors || null;
      } else {
        message = exception.message;
        errorCode = 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.getPrismaErrorMessage(exception);
      errorCode = `PRISMA_${exception.code}`;
      details = {
        code: exception.code,
        meta: exception.meta,
      };
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      errorCode = 'PRISMA_UNKNOWN_ERROR';
      details = {
        message: exception.message,
      };
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = 'GENERIC_ERROR';
      details = {
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Send error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }

  private getPrismaErrorMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'Unique constraint violation';
      case 'P2003':
        return 'Foreign key constraint violation';
      case 'P2025':
        return 'Record not found';
      case 'P2000':
        return 'Value too long for column';
      case 'P2001':
        return 'Record not found in where clause';
      case 'P2004':
        return 'Database constraint violation';
      case 'P2005':
        return 'Invalid value for field';
      case 'P2006':
        return 'Invalid value for field';
      case 'P2007':
        return 'Data validation error';
      case 'P2008':
        return 'Parsing error';
      case 'P2009':
        return 'Query parsing error';
      case 'P2010':
        return 'Raw query failed';
      case 'P2011':
        return 'Null constraint violation';
      case 'P2012':
        return 'Missing required value';
      case 'P2013':
        return 'Missing required argument';
      case 'P2014':
        return 'Relation violation';
      case 'P2015':
        return 'Related record not found';
      case 'P2016':
        return 'Query interpretation error';
      case 'P2017':
        return 'Relation connection error';
      case 'P2018':
        return 'Connected records not found';
      case 'P2019':
        return 'Input error';
      case 'P2020':
        return 'Value out of range';
      case 'P2021':
        return 'Table does not exist';
      case 'P2022':
        return 'Column does not exist';
      case 'P2023':
        return 'Column data type mismatch';
      case 'P2024':
        return 'Connection pool timeout';
      default:
        return 'Database operation failed';
    }
  }
}
