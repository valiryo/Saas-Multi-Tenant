import { Id, Result } from "@saas/shared";
import { IRepositorioSessao, SessaoInvalidaError } from "../../domain";
import { SessaoDoUsuarioInput } from "../dtos/sessao-do-usuario.input";

export class ValidarSessaoCasoDeUso {
    constructor(
        private readonly sessaoRepo: IRepositorioSessao,
    ) { }

    public async executar(input: SessaoDoUsuarioInput): Promise<Result<void>> {
        // Id.criar(undefined) geraria um id novo; tokens sem sid/sub devem ser rejeitados
        if (!input.sid || !input.usuarioId) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const sidResult = Id.criar(input.sid);
        const usuarioIdResult = Id.criar(input.usuarioId);
        if (sidResult.isFalha || usuarioIdResult.isFalha) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const sessao = await this.sessaoRepo.buscarPorId(sidResult.resultado);
        if (!sessao || !sessao.estaValidaPara(usuarioIdResult.resultado)) {
            return Result.falhar(new SessaoInvalidaError());
        }

        return Result.passar(undefined);
    }
}
