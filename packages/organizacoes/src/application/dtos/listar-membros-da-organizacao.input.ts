/** O vínculo do solicitante com a organização é verificado antes, pelo CargoGuard da rota. */
export class ListarMembrosDaOrganizacaoInput {
    constructor(
        public readonly organizacaoId: string,
    ){}
}
