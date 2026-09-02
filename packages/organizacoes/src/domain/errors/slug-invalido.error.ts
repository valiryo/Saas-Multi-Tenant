import { ErroDeDominio } from "@saas/shared";

export class SlugInvalidoError extends ErroDeDominio {
    constructor(valor: string, motivo: string) {
        super(`O slug "${valor}" é inválido: ${motivo}.`);
    }
}
