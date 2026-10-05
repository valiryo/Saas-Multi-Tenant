import { Id, Result } from "@saas/shared";
import { IRepositorioSessao, SessaoNaoEncontradaError } from "../../domain";
import { SessaoDoUsuarioInput } from "../dtos/sessao-do-usuario.input";

export class EncerrarSessaoCasoDeUso {
    constructor(
        private readonly sessaoRepo: IRepositorioSessao,
    ) { }

    public async executar(input: SessaoDoUsuarioInput): Promise<Result<void>> {
        if (!input.sid || !input.usuarioId) {
            return Result.falhar(new SessaoNaoEncontradaError());
        }

        const sidResult = Id.criar(input.sid);
        const usuarioIdResult = Id.criar(input.usuarioId);
        if (sidResult.isFalha || usuarioIdResult.isFalha) {
            return Result.falhar(new SessaoNaoEncontradaError());
        }

        const sessao = await this.sessaoRepo.buscarPorId(sidResult.resultado);

        // Sessão de outro usuário é tratada como inexistente para não revelar que o sid existe
        if (!sessao || !sessao.pertenceA(usuarioIdResult.resultado)) {
            return Result.falhar(new SessaoNaoEncontradaError());
        }

        sessao.revogar();
        await this.sessaoRepo.salvar(sessao);

        return Result.passar(undefined);
    }
}
