import { describe, expect, it } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { TipoCargo } from '@saas/shared';

import { VinculoAtual } from 'src/modules/auth/infrastructure/decorators/vinculo-atual.decorator';
import { VINCULO_ATUAL_KEY } from 'src/modules/auth/infrastructure/guards/cargo.guard';

describe('VinculoAtual', () => {
  // Extrai a função que o Nest executa para resolver o parâmetro decorado
  function obterFabrica(): (data: unknown, ctx: ExecutionContext) => unknown {
    class Rota {
      handler(@VinculoAtual() _vinculo: unknown) {}
    }
    const argumentos = Reflect.getMetadata(ROUTE_ARGS_METADATA, Rota, 'handler');
    return argumentos[Object.keys(argumentos)[0]!].factory;
  }

  function criarContexto(request: Record<string, unknown>): ExecutionContext {
    return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
  }

  it('deve devolver o vínculo guardado na request pelo CargoGuard', () => {
    const vinculo = { organizacaoId: 'org-id', tipoCargo: TipoCargo.PROPRIETARIO };

    expect(obterFabrica()(undefined, criarContexto({ [VINCULO_ATUAL_KEY]: vinculo }))).toBe(vinculo);
  });

  it('deve falhar como erro de configuração quando a rota não passou pelo CargoGuard', () => {
    expect(() => obterFabrica()(undefined, criarContexto({}))).toThrow(/@RequerCargo/);
  });
});
