import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';

import { CredenciaisInvalidasError } from '@saas/usuarios';

import { GlobalExceptionFilter } from '@shared/infrastructure/filters/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let response: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  let host: ArgumentsHost;
  let filtro: GlobalExceptionFilter;

  beforeEach(() => {
    response = { status: vi.fn(), json: vi.fn() };
    response.status.mockReturnValue(response);

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url: '/api/auth/login' }),
      }),
    } as unknown as ArgumentsHost;

    filtro = new GlobalExceptionFilter();
  });

  it('deve delegar erros de domínio para o mapeamento HTTP de domínio', () => {
    filtro.catch(new CredenciaisInvalidasError(), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: new CredenciaisInvalidasError().message,
        path: '/api/auth/login',
      }),
    );
  });

  it('deve repassar HttpException com seu status', () => {
    filtro.catch(new NotFoundException('não achou'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('deve responder 500 para erros desconhecidos', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    filtro.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    consoleError.mockRestore();
  });
});
