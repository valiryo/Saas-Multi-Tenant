import { IServicoCriptografia } from "@shared/domain/services/servico-criptografia";
import { IRepositorioUsuario } from "@users/domain/repositories/usuario.repositorio";
import { AutenticarUsuarioComando } from "../dtos/autenticar-usuario.comando";
import { Result } from "@shared/domain/value-objects/result";
import { Usuario } from "@users/domain/entities/usuario.entidade";
import { CredenciaisInvalidasError } from "@users/domain/errors/credenciais-invalidas.error";
import { Email } from "@shared/domain/value-objects/email";
import { SenhaForte } from "@users/domain/value-objects/senhaForte";
import { UsuarioAutenticadoDto } from "../dtos/usuario-autenticado.dto";

export class AutenticarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario,
        private readonly servicoCriptografia: IServicoCriptografia
    ){}

    public async executar(cmd: AutenticarUsuarioComando): Promise<Result<UsuarioAutenticadoDto>>{
        const emailResult = Email.criar(cmd.email);
        if(emailResult.isFalha){
            return Result.falhar(emailResult.falha);
        }
        const email = emailResult.resultado;

        const senhaResult = SenhaForte.criar(cmd.senha);
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

        const dto: UsuarioAutenticadoDto = {
            id: usuarioExistente.id.valor,
            email: usuarioExistente.email.valor,
            nome: usuarioExistente.nome.nomeCompleto,
        };

        return Result.passar(dto);
    }
}