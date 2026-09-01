import { Usuario, UsuarioProps } from "../../domain";
import { RegistrarUsuarioInput } from "../dtos/registrar-usuario.input";
import { Result } from "@saas/shared";
import { IRepositorioUsuario } from "../../domain";
import { IServicoCriptografia } from "../../domain/services/servico-criptografia";
import { UsuarioJaExistenteError } from "../../domain";
import { SenhaHash } from "../../domain";
import { SenhaForte } from "../../domain";
import { Email } from "@saas/shared";
import { NomeDePessoa } from "@saas/shared";

export class RegistrarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario, 
        private readonly servicoCriptografia: IServicoCriptografia
    ){}

    async executar(input: RegistrarUsuarioInput): Promise<Result<Usuario>> {
        const emailResult = Email.criar(input.email);
        if (emailResult.isFalha) {
            return Result.falhar(emailResult.falha);
        }
        const email = emailResult.resultado;

        const senhaResult = SenhaForte.criar(input.senha);
        if (senhaResult.isFalha) {
            return Result.falhar(senhaResult.falha);
        }
        const senha = senhaResult.resultado;

        const nomeResult = NomeDePessoa.criar(input.nome);
        if (nomeResult.isFalha) {
            return Result.falhar(nomeResult.falha);
        }
        const nome = nomeResult.resultado;

        // 1. Regra de Negócio: Email Único
        const usuarioJaExistente = await this.usuarioRepo.buscarPorEmail(email);
        if (usuarioJaExistente) {
            return Result.falhar(new UsuarioJaExistenteError(email.valor));
        }

        // 2. Criptografia Segura
        const senhaCriptografada = await this.servicoCriptografia.criptografar(senha.valor);
        const senhaHashResult = SenhaHash.criar(senhaCriptografada);
        if (senhaHashResult.isFalha) {
            return Result.falhar(senhaHashResult.falha);
        }
        const senhaHash = senhaHashResult.resultado;

        // 3. Criação da Entidade com Tratamento de Erro
        const novoUsuarioProps: UsuarioProps = {
            email,
            senhaHash,
            nome,
        };

        const usuarioResult = Usuario.criar(novoUsuarioProps);
        
        if (usuarioResult.isFalha) {
            return Result.falhar(usuarioResult.falha);
        }

        const novoUsuario = usuarioResult.resultado;

        // 4. Persistência
        await this.usuarioRepo.salvar(novoUsuario);

        return Result.passar(novoUsuario);
    }
}