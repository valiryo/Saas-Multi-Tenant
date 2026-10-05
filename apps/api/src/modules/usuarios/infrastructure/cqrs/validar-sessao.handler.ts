import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SessaoDoUsuarioInput, ValidarSessaoCasoDeUso } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { ValidarSessaoQuery } from "./validar-sessao.query";

@QueryHandler(ValidarSessaoQuery)
export class ValidarSessaoHandler implements IQueryHandler<ValidarSessaoQuery>{
    constructor(
        private readonly validarSessaoCasoDeUso: ValidarSessaoCasoDeUso
    ){}

    async execute(query: ValidarSessaoQuery): Promise<Result<void>> {
        return this.validarSessaoCasoDeUso.executar(new SessaoDoUsuarioInput(query.usuarioId, query.sid))
    }
}
