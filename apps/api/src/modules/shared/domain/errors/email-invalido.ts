import { ErroDeDominio } from "./erro-de-dominio";

export class EmailInvalidoError extends ErroDeDominio {
    constructor(valor: string) {
        super(`O valor "${valor}" não é um email válido.`);
    }
}