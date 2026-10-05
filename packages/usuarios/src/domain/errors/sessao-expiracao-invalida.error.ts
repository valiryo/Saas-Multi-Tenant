import { ErroDeDominio } from "@saas/shared";

export class SessaoExpiracaoInvalidaError extends ErroDeDominio {
    constructor() {
        super("A data de expiração da sessão deve ser maior que a data de criação.");
    }
}
