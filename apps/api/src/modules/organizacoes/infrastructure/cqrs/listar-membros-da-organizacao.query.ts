import { Query } from "@nestjs/cqrs";
import { Result } from "@saas/shared";
import { MembroOutput } from "@saas/organizacoes";

export class ListarMembrosDaOrganizacaoQuery extends Query<Result<MembroOutput[]>>{
    constructor(
        public readonly organizacaoId: string,
    ){
        super()
    }
}
