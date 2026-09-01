import { ErroDeDominio } from "@saas/shared";

export class SenhaHashInvalidaError extends ErroDeDominio {
    constructor(){
        super(`O hash da senha fornecido é inválido.`);
    }
}