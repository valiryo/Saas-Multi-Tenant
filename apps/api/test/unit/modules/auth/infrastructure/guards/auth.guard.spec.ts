import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { Result } from '@saas/shared';
import { SessaoInvalidaError } from '@saas/usuarios';

import { apiConfig } from 'src/config/api.config';
import { AuthGuard } from 'src/modules/auth/infrastructure/guards/auth.guard';
import { ValidarSessaoQuery } from '@users/infrastructure/cqrs/validar-sessao.query';

describe('AuthGuard', () => {
  const config = {
    jwtAccessSecret: 'access-secret',
    jwtRefreshSecret: 'refresh-secret',
  } as ConfigType<typeof apiConfig>;

  const SUB = '550e8400-e29b-41d4-a716-446655440000';
  const SID = '550e8400-e29b-41d4-a716-446655440001';

  let jwtService: JwtService;
  let reflector: Reflector;
  let queryBus: QueryBus;
  let guard: AuthGuard;

  function criarContexto(request: Record<string, any>): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  function requestComToken(token?: string): Record<string, any> {
    return { headers: token ? { authorization: `Bearer ${token}` } : {} };
  }

  function assinar(payload: object, secret = config.jwtAccessSecret) {
    return jwtService.signAsync(payload, { secret });
  }

  beforeEach(() => {
    jwtService = new JwtService({});
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(false) } as unknown as Reflector;
    queryBus = { execute: vi.fn().mockResolvedValue(Result.passar(undefined)) } as unknown as QueryBus;

    guard = new AuthGuard(reflector, jwtService, queryBus, config);
  });

  it('deve liberar rotas públicas sem verificar token', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);

    await expect(guard.canActivate(criarContexto(requestComToken()))).resolves.toBe(true);
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('deve rejeitar requisição sem token', async () => {
    await expect(guard.canActivate(criarContexto(requestComToken()))).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar header que não seja Bearer', async () => {
    const request = { headers: { authorization: 'Basic abc' } };

    await expect(guard.canActivate(criarContexto(request))).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar token com assinatura inválida', async () => {
    const token = await assinar({ sub: SUB, sid: SID, type: 'access' }, 'outro-secret');

    await expect(guard.canActivate(criarContexto(requestComToken(token)))).rejects.toThrow(UnauthorizedException);
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('deve rejeitar token que não seja do tipo access', async () => {
    const token = await assinar({ sub: SUB, sid: SID, type: 'refresh' });

    await expect(guard.canActivate(criarContexto(requestComToken(token)))).rejects.toThrow(UnauthorizedException);
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando a sessão for inválida', async () => {
    vi.mocked(queryBus.execute).mockResolvedValue(Result.falhar(new SessaoInvalidaError()));
    const token = await assinar({ sub: SUB, sid: SID, type: 'access' });

    await expect(guard.canActivate(criarContexto(requestComToken(token)))).rejects.toThrow(UnauthorizedException);
  });

  it('deve validar a sessão e popular request.user quando tudo for válido', async () => {
    const token = await assinar({ sub: SUB, sid: SID, email: 'dev@mail.com', vinculoProps: [], type: 'access' });
    const request = requestComToken(token);

    await expect(guard.canActivate(criarContexto(request))).resolves.toBe(true);

    expect(queryBus.execute).toHaveBeenCalledWith(new ValidarSessaoQuery(SUB, SID));
    expect(request.user).toMatchObject({ sub: SUB, sid: SID, email: 'dev@mail.com' });
  });
});
