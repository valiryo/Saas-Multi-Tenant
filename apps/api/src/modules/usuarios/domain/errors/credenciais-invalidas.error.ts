import { ErroDeDominio } from "@shared/domain/errors/erro-de-dominio";

export class CredenciaisInvalidasError extends Error implements ErroDeDominio {
    constructor() {
        super("E-mail ou senha inválidos.");
        this.name = "CredenciaisInvalidasError";
    }
}