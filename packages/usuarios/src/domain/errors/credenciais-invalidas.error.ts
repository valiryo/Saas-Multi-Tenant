import { ErroDeDominio } from "@saas/shared";

export class CredenciaisInvalidasError extends Error implements ErroDeDominio {
    constructor() {
        super("E-mail ou senha inválidos.");
        this.name = "CredenciaisInvalidasError";
    }
}