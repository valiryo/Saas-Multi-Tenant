import { ErroDeDominio } from "@saas/shared";

export class SessaoNaoEncontradaError extends ErroDeDominio {
    constructor() {
        super("Sessão não encontrada.");
    }
}
