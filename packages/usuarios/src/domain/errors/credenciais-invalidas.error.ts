import { ErroDeDominio } from "@saas/shared";

export class CredenciaisInvalidasError extends ErroDeDominio {
    constructor() {
        super("E-mail ou senha inválidos.");
    }
}
