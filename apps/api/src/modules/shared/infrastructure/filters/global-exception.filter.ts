import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { ErroDeDominio } from '@saas/shared';
import { DomainExceptionFilter } from './domain-exception.filter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly domainExceptionFilter = new DomainExceptionFilter();

  catch(exception: unknown, host: ArgumentsHost) {
    // Este filtro (catch-all, registrado em main.ts) tem precedência sobre o DomainExceptionFilter
    // registrado via APP_FILTER; por isso erros de domínio são delegados explicitamente.
    if (exception instanceof ErroDeDominio) {
      return this.domainExceptionFilter.catch(exception, host);
    }

    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      return response.status(status).json(body);
    }

    console.error('Erro não tratado:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      path: request.url,
    });
  }
}
