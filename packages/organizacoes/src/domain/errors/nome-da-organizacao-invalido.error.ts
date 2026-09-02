import { ErroDeDominio } from "@saas/shared";

export class NomeDaOrganizacaoInvalidoError extends ErroDeDominio {
    constructor(mensagem: string) {
        super(`Nome de organização inválido: ${mensagem}.`);
    }
}
