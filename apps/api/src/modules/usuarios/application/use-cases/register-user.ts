import { UsuarioProps, Usuario} from "@users/domain/entities/usuario.entidade";
import { RegistrarUsuarioComando } from "../dtos/registrar-usuario.comando";
import { Result } from "@shared/domain/value-objects/result";
import { IRepositorioUsuario } from "src/modules/usuarios/domain/repositories/usuario.repositorio";
import { IServicoCriptografia } from "@shared/domain/services/servico-criptografia";
import { UsuarioJaExistenteError } from "@users/domain/errors/usuario-ja-existente.error";
import { SenhaHash } from "@users/domain/value-objects/senhaHash";
import { SenhaForte } from "@users/domain/value-objects/senhaForte";
import { Email } from "@shared/domain/value-objects/email";
import { NomeDePessoa } from "@shared/domain/value-objects/nome-de-pessoa";

export class RegistrarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario, 
        private readonly servicoCriptografia: IServicoCriptografia
    ){}

    async executar(cmd: RegistrarUsuarioComando): Promise<Result<Usuario>> {
        const emailResult = Email.criar(cmd.email);
        if (emailResult.isFalha) {
            return Result.falhar(emailResult.falha);
        }
        const email = emailResult.resultado;

        const senhaResult = SenhaForte.criar(cmd.senha);
        if (senhaResult.isFalha) {
            return Result.falhar(senhaResult.falha);
        }
        const senha = senhaResult.resultado;

        const nomeResult = NomeDePessoa.criar(cmd.nome);
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