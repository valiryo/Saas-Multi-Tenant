import { Id, Result } from "@saas/shared";
import { IRepositorioSessao, SessaoInvalidaError } from "../../domain";
import { SessaoDoUsuarioInput } from "../dtos/sessao-do-usuario.input";

export class EncerrarOutrasSessoesCasoDeUso {
    constructor(
        private readonly sessaoRepo: IRepositorioSessao,
    ) { }

    /** Revoga todas as sessões do usuário, exceto a sessão atual (`input.sid`). */
    public async executar(input: SessaoDoUsuarioInput): Promise<Result<void>> {
        if (!input.sid || !input.usuarioId) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const usuarioIdResult = Id.criar(input.usuarioId);
        const sidAtualResult = Id.criar(input.sid);
        if (usuarioIdResult.isFalha || sidAtualResult.isFalha) {
            return Result.falhar(new SessaoInvalidaError());
        }

        await this.sessaoRepo.revogarTodasDoUsuario(
            usuarioIdResult.resultado,
            sidAtualResult.resultado,
        );

        return Result.passar(undefined);
    }
}
