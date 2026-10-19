import { VinculoEmpregaticio } from "../entities/vinculo-empregaticio.entidade";

import { Id } from "../value-objects/id";
import { Result } from "../value-objects/result";

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

  /**
   * Altera um vínculo sob uma trava da organização: alterações de membros da mesma organização
   * acontecem uma de cada vez. `alterar` recebe os vínculos ativos lidos já com a trava e devolve
   * o vínculo a gravar; se devolver uma falha, nada é gravado e a falha é repassada.
   * Use quando a regra depende dos demais membros (ex.: a organização não pode ficar sem PROPRIETARIO).
   */
  alterarComTravaDaOrganizacao(
    organizacaoId: Id,
    alterar: (vinculosAtivos: VinculoEmpregaticio[]) => Result<VinculoEmpregaticio>,
  ): Promise<Result<VinculoEmpregaticio>>;
}