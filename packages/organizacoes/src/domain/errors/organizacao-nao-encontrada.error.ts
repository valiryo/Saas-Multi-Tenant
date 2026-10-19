import { ErroDeDominio } from "@saas/shared";

export class OrganizacaoNaoEncontradaError extends ErroDeDominio {
    constructor() {
        super("Organização não encontrada.");
    }
}
