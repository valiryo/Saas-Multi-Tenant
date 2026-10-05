import { Id, IRepositorioVinculoEmpregaticio, Result } from "@saas/shared";
import { IRepositorioSessao, IRepositorioUsuario, SessaoInvalidaError } from "../../domain";
import { RenovarTokensInput } from "../dtos/renovar-tokens.input";
import { RenovarTokensOutput } from "../dtos/renovar-tokens.output";
import { IServicoTokenAutenticacao } from "../ports/servico-token-autenticacao.service";
import { montarTokenPayload } from "../helpers/montar-token-payload";

export class RenovarTokensCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario,
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
        private readonly sessaoRepo: IRepositorioSessao,
        private readonly servicoAutenticacao: IServicoTokenAutenticacao
    ) { }

    public async executar(input: RenovarTokensInput): Promise<Result<RenovarTokensOutput>> {
        const payload = await this.servicoAutenticacao.verificarRefreshToken(input.refreshToken);
        if (!payload || !payload.sid || !payload.sub) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const sidResult = Id.criar(payload.sid);
        const usuarioIdResult = Id.criar(payload.sub);
        if (sidResult.isFalha || usuarioIdResult.isFalha) {
            return Result.falhar(new SessaoInvalidaError());
        }
        const usuarioId = usuarioIdResult.resultado;

        const sessao = await this.sessaoRepo.buscarPorId(sidResult.resultado);
        if (!sessao || !sessao.estaValidaPara(usuarioId)) {
            return Result.falhar(new SessaoInvalidaError());
        }

        const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) {
            return Result.falhar(new SessaoInvalidaError());
        }

        // Vínculos recarregados para refletir mudanças de cargo/organização desde o login
        const vinculos = await this.vinculoRepo.listarAtivosPorUsuario(usuarioId);

        const tokens = await this.servicoAutenticacao.gerarTokens(
            montarTokenPayload(usuario, sessao, vinculos),
        );

        return Result.passar(tokens);
    }
}
