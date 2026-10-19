export class CriarOrganizacaoInput {
    constructor(
        public readonly nome: string,
        public readonly criadorId: string,
        public readonly slug?: string,
    ){}
}
