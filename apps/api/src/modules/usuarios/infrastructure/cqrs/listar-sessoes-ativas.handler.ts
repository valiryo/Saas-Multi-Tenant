import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListarSessoesAtivasCasoDeUso, SessaoDoUsuarioInput, SessaoOutput } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { ListarSessoesAtivasQuery } from "./listar-sessoes-ativas.query";

@QueryHandler(ListarSessoesAtivasQuery)
export class ListarSessoesAtivasHandler implements IQueryHandler<ListarSessoesAtivasQuery>{
    constructor(
        private readonly listarSessoesAtivasCasoDeUso: ListarSessoesAtivasCasoDeUso
    ){}

    async execute(query: ListarSessoesAtivasQuery): Promise<Result<SessaoOutput[]>> {
        return this.listarSessoesAtivasCasoDeUso.executar(new SessaoDoUsuarioInput(query.usuarioId, query.sidAtual))
    }
}
