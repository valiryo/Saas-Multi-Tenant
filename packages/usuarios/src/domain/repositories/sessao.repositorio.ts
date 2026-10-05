import { Id } from "@saas/shared";
import { Sessao } from "../entities/sessao.entidade";

export interface IRepositorioSessao {
  salvar(sessao: Sessao): Promise<void>;
  buscarPorId(id: Id): Promise<Sessao | null>;
  buscarAtivasPorUsuarioId(usuarioId: Id): Promise<Sessao[]>;
  revogarTodasDoUsuario(usuarioId: Id, excetoSessaoId?: Id): Promise<void>;
}