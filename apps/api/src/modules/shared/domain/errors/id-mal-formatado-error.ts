import { ErroDeDominio } from "./erro-de-dominio";

export class IdMalFormatadoError extends ErroDeDominio {
    constructor(valor: string) {
        super(`O valor "${valor}" não é um UUID v4 válido.`);
    }
}