import { Query } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { MinhaOrganizacaoOutput } from "@saas/organizacoes";

export class ListarMinhasOrganizacoesQuery extends Query<Result<MinhaOrganizacaoOutput[]>>{
    constructor(
        public readonly usuarioId: string,
    ){
        super()
    }
}
