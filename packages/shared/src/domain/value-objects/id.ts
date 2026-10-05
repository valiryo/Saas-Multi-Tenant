import { v4 as uuidv4 } from 'uuid';
import { Result } from './result';
import { IdMalFormatadoError } from '../errors/id-mal-formatado-error';

export class Id {
    private readonly _valor: string;
    private constructor(valor?: string) {
        this._valor = valor ?? uuidv4();
    }

    static criar(valor?: string): Result<Id> {
        if (valor) {
            const resultId = this.validar(valor);
            if (resultId.isFalha) {
                return Result.falhar(resultId.falha);
            }
            return Result.passar(new Id(valor));
        }
        return Result.passar(new Id());
    }

    private static validar(value: string): Result<true> {
        const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if(!uuidV4Regex.test(value)) return Result.falhar(new IdMalFormatadoError(value));

        return Result.passar(true);
    }

    get valor(): string {
        return this._valor;
    }

    public equals(outro: Id): boolean {
        return this._valor === outro._valor;
    }
}