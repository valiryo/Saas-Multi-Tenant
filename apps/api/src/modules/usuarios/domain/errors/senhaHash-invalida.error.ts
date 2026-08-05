import { ErroDeDominio } from "@shared/domain/errors/erro-de-dominio";

export class SenhaHashInvalidaError extends ErroDeDominio {
    constructor(){
        super(`O hash da senha fornecido é inválido.`);
    }
}