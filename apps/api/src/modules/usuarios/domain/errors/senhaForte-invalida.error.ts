import { ErroDeDominio } from "@shared/domain/errors/erro-de-dominio";

export class SenhaForteInvalidaError extends ErroDeDominio {
    constructor(mensagem: string){
        super(mensagem);
    }
}