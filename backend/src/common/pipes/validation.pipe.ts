import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    });

    if (errors.length > 0) {
      const validationErrors = this.formatValidationErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
        statusCode: 400,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map((error) => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children
        ? this.formatValidationErrors(error.children)
        : [],
    }));
  }
}
