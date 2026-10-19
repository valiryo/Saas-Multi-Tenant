import { ErroDeDominio } from "@saas/shared";

export class CargoNaoPermitidoError extends ErroDeDominio {
    constructor(cargo: string, motivo: string) {
        super(`O cargo ${cargo} não é permitido: ${motivo}.`);
    }
}
