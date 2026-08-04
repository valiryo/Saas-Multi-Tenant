import { UsuarioProps, Usuario} from "@users/domain/entities/usuario.entidade";
import { RegistrarUsuarioComando } from "../dtos/registrar-usuario-comando";
import { Result } from "@shared/domain/value-objects/result";
import { IRepositorioUsuario } from "src/modules/usuarios/domain/repositories/usuario.repositorio";
import { ServicoCriptografia } from "@shared/domain/repositories/servico-criptografia";
import { UsuarioJaExistenteError } from "@users/domain/errors/usuario-ja-existente-error";

export class RegistrarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario, 
        private readonly servicoCriptografia: ServicoCriptografia
    ){}

    async executar(cmd: RegistrarUsuarioComando): Promise<Result<Usuario>> {
        const { email, password: senha, name: nome } = cmd;

        // 1. Regra de Negócio: Email Único
        const usuarioJaExistente = await this.usuarioRepo.buscarPorEmail(email);
        if (usuarioJaExistente) {
            return Result.fail(new UsuarioJaExistenteError(email.valor));
        }

        // 2. Criptografia Segura
        const criptografiaResult = await this.servicoCriptografia.criptografar(senha.valor);
        if (criptografiaResult.isFailure) {
            return Result.fail(criptografiaResult.error);
        }
        const senhaHash = criptografiaResult.value;

        // 3. Criação da Entidade com Tratamento de Erro
        const novoUsuarioProps: UsuarioProps = {
            email,
            senhaHash,
            nome,
            organizacaoIds: []
        };

        const usuarioResult = Usuario.criar(novoUsuarioProps);
        
        // Em vez de .value, verificamos a falha. 
        // Se Usuario.criar ganhar novas regras no futuro, seu código já está protegido.
        if (usuarioResult.isFailure) {
            return Result.fail(usuarioResult.error);
        }

        const novoUsuario = usuarioResult.value;

        // 4. Persistência
        await this.usuarioRepo.salvar(novoUsuario);

        return Result.ok(novoUsuario);
    }
}