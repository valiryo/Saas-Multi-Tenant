import { Result } from "@saas/shared";
import { NomeDaOrganizacaoInvalidoError } from "../errors/nome-da-organizacao-invalido.error";

const NOME_ORGANIZACAO_MIN_LENGTH = 2;
const NOME_ORGANIZACAO_MAX_LENGTH = 100;

export class NomeDaOrganizacao {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static criar(valor: string): Result<NomeDaOrganizacao> {
        const erros = NomeDaOrganizacao.validar(valor);

        if (erros.length > 0) {
            return Result.falhar(new NomeDaOrganizacaoInvalidoError(erros.join(', ')));
        }

        return Result.passar(new NomeDaOrganizacao(valor.trim()));
    }

    static validar(valor: string): string[] {
        const erros: string[] = [];

        if (!valor || valor.trim().length === 0) {
            erros.push('nome obrigatório');
            return erros;
        }

        const nomeLimpo = valor.trim();

        if (nomeLimpo.length < NOME_ORGANIZACAO_MIN_LENGTH) {
            erros.push(`deve ter pelo menos ${NOME_ORGANIZACAO_MIN_LENGTH} caracteres`);
        }

        if (nomeLimpo.length > NOME_ORGANIZACAO_MAX_LENGTH) {
            erros.push(`deve ter no máximo ${NOME_ORGANIZACAO_MAX_LENGTH} caracteres`);
        }

        return erros;
    }

    get valor(): string {
        return this._valor;
    }
}
