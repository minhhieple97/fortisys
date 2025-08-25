import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse();

    let validationErrors = [];
    let message = 'Validation failed';

    // Check if this is a validation error
    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      if (responseObj.errors && Array.isArray(responseObj.errors)) {
        validationErrors = responseObj.errors;
        message = responseObj.message || 'Validation failed';
      } else if (responseObj.message && Array.isArray(responseObj.message)) {
        // Handle class-validator format
        validationErrors = this.formatClassValidatorErrors(responseObj.message);
        message = 'Validation failed';
      }
    }

    // Log validation errors
    this.logger.warn(
      `${request.method} ${request.url} - Validation failed: ${JSON.stringify(validationErrors)}`,
    );

    const errorResponse = {
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode: 'VALIDATION_ERROR',
      errors: validationErrors,
    };

    response.status(400).json(errorResponse);
  }

  private formatClassValidatorErrors(errors: string[]): any[] {
    return errors.map((error) => {
      // Parse class-validator error format
      const match = error.match(/^([^.]+)\.([^:]+): (.+)$/);
      if (match) {
        return {
          field: match[2],
          message: match[3],
          value: null,
        };
      }

      return {
        field: 'unknown',
        message: error,
        value: null,
      };
    });
  }
}
