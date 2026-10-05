import { Query } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { SessaoOutput } from "@saas/usuarios";

export class ListarSessoesAtivasQuery extends Query<Result<SessaoOutput[]>>{
    constructor(
        public readonly usuarioId: string,
        public readonly sidAtual: string,
    ){
        super()
    }
}
