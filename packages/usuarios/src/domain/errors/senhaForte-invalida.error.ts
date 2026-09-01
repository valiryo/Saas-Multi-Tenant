import { ErroDeDominio } from "@saas/shared";

export class SenhaForteInvalidaError extends ErroDeDominio {
    constructor(mensagem: string){
        super(mensagem);
    }
}