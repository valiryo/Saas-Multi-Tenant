import { Result, FormatadorDeTexto } from "@saas/shared";
import { SlugInvalidoError } from "../errors/slug-invalido.error";

const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 63;
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class Slug {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static criar(valorBruto: string): Result<Slug> {
        const valorFormatado = FormatadorDeTexto.slugify(valorBruto ?? '');

        const validacaoResult = Slug.validar(valorFormatado);
        if (validacaoResult.isFalha) {
            return Result.falhar(validacaoResult.falha);
        }

        return Result.passar(new Slug(valorFormatado));
    }

    private static validar(valor: string): Result<true> {
        if (!valor || valor.length < SLUG_MIN_LENGTH) {
            return Result.falhar(new SlugInvalidoError(valor, `deve ter pelo menos ${SLUG_MIN_LENGTH} caracteres`));
        }

        if (valor.length > SLUG_MAX_LENGTH) {
            return Result.falhar(new SlugInvalidoError(valor, `deve ter no máximo ${SLUG_MAX_LENGTH} caracteres`));
        }

        if (!SLUG_REGEX.test(valor)) {
            return Result.falhar(new SlugInvalidoError(valor, 'deve conter apenas letras minúsculas, números e hífens'));
        }

        return Result.passar(true);
    }

    get valor(): string {
        return this._valor;
    }
}
