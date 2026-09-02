import { Usuario } from "../../domain";
import { RegistrarUsuarioInput } from "../dtos/registrar-usuario.input";
import { Result } from "@saas/shared";
import { IRepositorioUsuario } from "../../domain";
import { IServicoCriptografia } from "../../domain/services/servico-criptografia";
import { UsuarioJaExistenteError } from "../../domain";
import { SenhaForte } from "../../domain";

export class RegistrarUsuarioCasoDeUso {
    constructor(
        private readonly usuarioRepo: IRepositorioUsuario,
        private readonly servicoCriptografia: IServicoCriptografia
    ){}

    async executar(input: RegistrarUsuarioInput): Promise<Result<Usuario>> {

        const senhaResult = SenhaForte.criar(input.senha);
        if (senhaResult.isFalha) {
            return Result.falhar(senhaResult.falha);
        }
        const senha = senhaResult.resultado;

        // 2. Criptografia Segura
        const senhaCriptografada = await this.servicoCriptografia.criptografar(senha.valor);

        // 3. Criação da Entidade com Tratamento de Erro
        const usuarioResult = Usuario.criar({
            email: input.email,
            senhaHash: senhaCriptografada,
            nome: input.nome,
        });

        if (usuarioResult.isFalha) {
            return Result.falhar(usuarioResult.falha);
        }

        const novoUsuario = usuarioResult.resultado;

        // 4. Regra de Negócio: Email Único
        const usuarioJaExistente = await this.usuarioRepo.buscarPorEmail(novoUsuario.email);
        if (usuarioJaExistente) {
            return Result.falhar(new UsuarioJaExistenteError(novoUsuario.email.valor));
        }

        // 5. Persistência
        await this.usuarioRepo.salvar(novoUsuario);

        return Result.passar(novoUsuario);
    }
}
