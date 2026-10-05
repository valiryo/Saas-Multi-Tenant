import { Query } from "@nestjs/cqrs";
import { Result } from "@saas/shared";

export class ValidarSessaoQuery extends Query<Result<void>>{
    constructor(
        public readonly usuarioId: string,
        public readonly sid: string,
    ){
        super()
    }
}
