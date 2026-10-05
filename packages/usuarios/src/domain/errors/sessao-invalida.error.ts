import { ErroDeDominio } from "@saas/shared";

export class SessaoInvalidaError extends ErroDeDominio {
    constructor() {
        super("Sessão inválida ou expirada. Faça login novamente.");
    }
}
