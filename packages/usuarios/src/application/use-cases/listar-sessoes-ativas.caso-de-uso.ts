import { Id, Result } from "@saas/shared";
import { IRepositorioSessao, SessaoInvalidaError } from "../../domain";
import { SessaoDoUsuarioInput } from "../dtos/sessao-do-usuario.input";
import { SessaoOutput } from "../dtos/sessao.output";

export class ListarSessoesAtivasCasoDeUso {
    constructor(
        private readonly sessaoRepo: IRepositorioSessao,
    ) { }

    /** Lista as sessões ativas do usuário, marcando a sessão atual (`input.sid`). */
    public async executar(input: SessaoDoUsuarioInput): Promise<Result<SessaoOutput[]>> {
        if (!input.usuarioId) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const usuarioIdResult = Id.criar(input.usuarioId);
        if (usuarioIdResult.isFalha) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const sessoes = await this.sessaoRepo.buscarAtivasPorUsuarioId(usuarioIdResult.resultado);

        return Result.passar(sessoes.map(sessao => ({
            sid: sessao.sid.valor,
            userAgent: sessao.userAgent,
            ipAddress: sessao.ipAddress.valor,
            criadaEm: sessao.criadaEm,
            expiraEm: sessao.expiraEm,
            atual: sessao.sid.valor === input.sid,
        })));
    }
}
