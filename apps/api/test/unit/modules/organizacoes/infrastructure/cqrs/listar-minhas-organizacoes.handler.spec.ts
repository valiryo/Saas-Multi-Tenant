import { describe, expect, it, vi } from "vitest";
import { Result } from "@saas/shared";
import { ListarMinhasOrganizacoesCasoDeUso, ListarMinhasOrganizacoesInput } from "@saas/organizacoes";

import { ListarMinhasOrganizacoesQuery } from "@organizacoes/infrastructure/cqrs/listar-minhas-organizacoes.query";
import { ListarMinhasOrganizacoesHandler } from "@organizacoes/infrastructure/cqrs/listar-minhas-organizacoes.handler";

describe("ListarMinhasOrganizacoesHandler", () => {
  it("deve repassar o usuário ao caso de uso e devolver o resultado", async () => {
    const organizacoes = [{ id: "org-id" }];
    const casoDeUso = {
      executar: vi.fn().mockResolvedValue(Result.passar(organizacoes)),
    } as unknown as ListarMinhasOrganizacoesCasoDeUso;
    const handler = new ListarMinhasOrganizacoesHandler(casoDeUso);

    const resultado = await handler.execute(new ListarMinhasOrganizacoesQuery("usuario-id"));

    expect(casoDeUso.executar).toHaveBeenCalledWith(new ListarMinhasOrganizacoesInput("usuario-id"));
    expect(resultado.resultado).toBe(organizacoes);
  });
});
