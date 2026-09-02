import { ErroDeDominio } from "@saas/shared";

export class OrganizacaoJaExistenteError extends ErroDeDominio {
    constructor(slug: string) {
        super(`Já existe uma organização com o slug: ${slug}`);
    }
}
