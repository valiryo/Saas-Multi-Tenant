import { IServicoCriptografia } from "../../domain/services/servico-criptografia";
import { IRepositorioSessao, IRepositorioUsuario, Sessao } from "../../domain";
import { AutenticarUsuarioInput } from "../dtos/autenticar-usuario.input";
import { IRepositorioVinculoEmpregaticio, Result } from "@saas/shared";
import { CredenciaisInvalidasError } from "../../domain";
import { Email } from "@saas/shared";
import { AutenticarUsuarioOutput } from "../dtos/autenticar-usuario.output";
import { IServicoTokenAutenticacao } from "../ports/servico-token-autenticacao.service";
import { DURACAO_SESSAO } from "../../domain/constraints/constraints";
import { montarTokenPayload } from "../helpers/montar-token-payload";
import ms from "ms"

export class AutenticarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario,
        private readonly vinculoRepo: IRepositorioVinculoEmpregaticio,
        private readonly sessaoRepo: IRepositorioSessao,
        private readonly servicoCriptografia: IServicoCriptografia,
        private readonly servicoAutenticacao: IServicoTokenAutenticacao
    ) { }

    public async executar(input: AutenticarUsuarioInput): Promise<Result<AutenticarUsuarioOutput>> {
        const emailResult = Email.criar(input.email);
        if (emailResult.isFalha) {
            return Result.falhar(new CredenciaisInvalidasError());
        }
        const email = emailResult.resultado;

        // A força da senha não é validada aqui: isso é regra de cadastro.
        // No login basta comparar com o hash salvo.
        if (!input.senha) {
            return Result.falhar(new CredenciaisInvalidasError());
        }

        const usuarioExistente = await this.usuarioRepo.buscarPorEmail(email);
        if (!usuarioExistente) {
            return Result.falhar(new CredenciaisInvalidasError());
        }

        const senhaHashDoBanco = usuarioExistente.senhaHash.valor;
        const isSenhaValida = await this.servicoCriptografia.comparar(input.senha, senhaHashDoBanco);
        if (!isSenhaValida) {
            return Result.falhar(new CredenciaisInvalidasError());
        }

        const criadaEm = new Date();
        const novaSessaoResult = Sessao.criar({
            usuarioId: usuarioExistente.id.valor,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
            criadaEm,
            expiraEm: new Date(criadaEm.getTime() + ms(DURACAO_SESSAO)),
        });
        if (novaSessaoResult.isFalha) {
            return Result.falhar(novaSessaoResult.falha);
        }
        const novaSessao = novaSessaoResult.resultado;

        const vinculos = await this.vinculoRepo.listarAtivosPorUsuario(usuarioExistente.id);

        await this.sessaoRepo.salvar(novaSessao);

        const tokens = await this.servicoAutenticacao.gerarTokens(
            montarTokenPayload(usuarioExistente, novaSessao, vinculos),
        );

        return Result.passar(tokens);
    }
}
