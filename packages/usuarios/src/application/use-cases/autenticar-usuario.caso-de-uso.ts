import { IServicoCriptografia } from "../../domain/services/servico-criptografia";
import { IRepositorioUsuario } from "../../domain";
import { AutenticarUsuarioInput } from "../dtos/autenticar-usuario.input";
import { Result } from "@saas/shared";
import { CredenciaisInvalidasError } from "../../domain";
import { Email } from "@saas/shared";
import { SenhaForte } from "../../domain";
import { AutenticarUsuarioOutput } from "../dtos/autenticar-usuario.output";
import { IServicoTokenAutenticacao } from "../ports/servico-token-autenticacao.service";

export class AutenticarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario,
        private readonly servicoCriptografia: IServicoCriptografia,
        private readonly servicoAutenticacao: IServicoTokenAutenticacao
    ){}

    public async executar(input: AutenticarUsuarioInput): Promise<Result<AutenticarUsuarioOutput>>{
        const emailResult = Email.criar(input.email);
        if(emailResult.isFalha){
            return Result.falhar(emailResult.falha);
        }
        const email = emailResult.resultado;

        const senhaResult = SenhaForte.criar(input.senha);
        if(senhaResult.isFalha){
            return Result.falhar(senhaResult.falha);
        }
        const senha = senhaResult.resultado;
    

        const usuarioExistente = await this.usuarioRepo.buscarPorEmail(email);
        if(!usuarioExistente){
            return Result.falhar(new CredenciaisInvalidasError());
        }

        const senhaHashDoBanco = usuarioExistente.senhaHash.valor;
        const isSenhaValida = await this.servicoCriptografia.comparar(senha.valor, senhaHashDoBanco);
        if(!isSenhaValida){
            return Result.falhar(new CredenciaisInvalidasError());
        }

        const tokens = await this.servicoAutenticacao.gerarTokens({
            sub: usuarioExistente.id.valor,
            email: usuarioExistente.email.valor,
            nome: usuarioExistente.nome.nomeCompleto
        })

        return Result.passar(tokens);
    }
}