import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';

import { Result, TipoCargo } from '@saas/shared';
import { OrganizacaoNaoEncontradaError, PermissaoInsuficienteError } from '@saas/organizacoes';

import { CARGOS_PERMITIDOS_KEY, CargoGuard, VINCULO_ATUAL_KEY } from 'src/modules/auth/infrastructure/guards/cargo.guard';
import { VerificarCargoNaOrganizacaoQuery } from '@organizacoes/infrastructure/cqrs/verificar-cargo-na-organizacao.query';

describe('CargoGuard', () => {
  const SUB = '550e8400-e29b-41d4-a716-446655440000';
  const ORGANIZACAO_ID = '550e8400-e29b-41d4-a716-446655440001';
  const GESTORES = [TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR];

  let reflector: Reflector;
  let queryBus: QueryBus;
  let guard: CargoGuard;

  function criarContexto(request: Record<string, any>): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  function requestAutenticada(params: Record<string, string> = { organizacaoId: ORGANIZACAO_ID }) {
    return { user: { sub: SUB, sid: 'sid', email: 'dev@mail.com', vinculoProps: [] }, params };
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(GESTORES) } as unknown as Reflector;
    queryBus = {
      execute: vi.fn().mockResolvedValue(
        Result.passar({ organizacaoId: ORGANIZACAO_ID, tipoCargo: TipoCargo.ADMINISTRADOR }),
      ),
    } as unknown as QueryBus;

    guard = new CargoGuard(reflector, queryBus);
  });

  it('deve ler os cargos exigidos do handler e, como fallback, do controller', async () => {
    const contexto = criarContexto(requestAutenticada());

    await guard.canActivate(contexto);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(CARGOS_PERMITIDOS_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
  });

  it.each([undefined, []])('deve liberar rotas sem cargos exigidos (%j) sem consultar o banco', async (cargos) => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(cargos);

    await expect(guard.canActivate(criarContexto({ params: {} }))).resolves.toBe(true);
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('deve consultar o cargo do usuário na organização da rota e liberar quando ele for permitido', async () => {
    await expect(guard.canActivate(criarContexto(requestAutenticada()))).resolves.toBe(true);

    expect(queryBus.execute).toHaveBeenCalledTimes(1);
    expect(queryBus.execute).toHaveBeenCalledWith(new VerificarCargoNaOrganizacaoQuery(SUB, ORGANIZACAO_ID, GESTORES));
  });

  it('deve guardar na request o vínculo verificado, para os casos de uso não consultarem de novo', async () => {
    const request: Record<string, any> = requestAutenticada();

    await guard.canActivate(criarContexto(request));

    expect(request[VINCULO_ATUAL_KEY]).toEqual({ organizacaoId: ORGANIZACAO_ID, tipoCargo: TipoCargo.ADMINISTRADOR });
  });

  it('não deve guardar vínculo na request quando o acesso for negado', async () => {
    vi.mocked(queryBus.execute).mockResolvedValue(Result.falhar(new PermissaoInsuficienteError()));
    const request: Record<string, any> = requestAutenticada();

    await expect(guard.canActivate(criarContexto(request))).rejects.toThrow();
    expect(request[VINCULO_ATUAL_KEY]).toBeUndefined();
  });

  it('deve lançar PermissaoInsuficienteError quando o usuário não tiver um dos cargos exigidos', async () => {
    vi.mocked(queryBus.execute).mockResolvedValue(Result.falhar(new PermissaoInsuficienteError()));

    await expect(guard.canActivate(criarContexto(requestAutenticada()))).rejects.toBeInstanceOf(
      PermissaoInsuficienteError,
    );
  });

  it('deve lançar OrganizacaoNaoEncontradaError quando a organização não existir', async () => {
    vi.mocked(queryBus.execute).mockResolvedValue(Result.falhar(new OrganizacaoNaoEncontradaError()));

    await expect(guard.canActivate(criarContexto(requestAutenticada()))).rejects.toBeInstanceOf(
      OrganizacaoNaoEncontradaError,
    );
  });

  it('deve rejeitar com 401 quando não houver usuário autenticado na requisição', async () => {
    await expect(guard.canActivate(criarContexto({ params: { organizacaoId: ORGANIZACAO_ID } }))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(queryBus.execute).not.toHaveBeenCalled();
  });

  it('deve falhar como erro de configuração quando a rota não tiver o parâmetro :organizacaoId', async () => {
    await expect(guard.canActivate(criarContexto(requestAutenticada({ id: ORGANIZACAO_ID })))).rejects.toThrow(
      /:organizacaoId/,
    );
    expect(queryBus.execute).not.toHaveBeenCalled();
  });
});
