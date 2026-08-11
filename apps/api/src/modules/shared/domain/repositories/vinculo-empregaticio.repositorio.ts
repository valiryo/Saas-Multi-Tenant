import { VinculoEmpregaticio } from
  "@shared/domain/entities/vinculo-empregaticio.entidade";

import { Id } from
  "@shared/domain/value-objects/id";

export interface IRepositorioVinculoEmpregaticio {
  buscarPorId(
    id: Id,
  ): Promise<VinculoEmpregaticio | null>;

  buscarPorUsuarioEOrganizacao(
    usuarioId: Id,
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio | null>;

  buscarAtivoPorUsuarioEOrganizacao(
    usuarioId: Id,
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio | null>;

  listarPorUsuario(
    usuarioId: Id,
  ): Promise<VinculoEmpregaticio[]>;

  listarAtivosPorUsuario(
    usuarioId: Id,
  ): Promise<VinculoEmpregaticio[]>;

  listarPorOrganizacao(
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio[]>;

  listarAtivosPorOrganizacao(
    organizacaoId: Id,
  ): Promise<VinculoEmpregaticio[]>;

  salvar(
    vinculo: VinculoEmpregaticio,
  ): Promise<VinculoEmpregaticio>;
}