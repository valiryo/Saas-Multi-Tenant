import { SenhaForte } from "./senhaForte";
import { ServicoCriptografia } from "../../../shared/domain/services/servico-criptografia";
import { Result } from "@shared/domain/value-objects/result";
import { SenhaHashInvalidaError } from "../errors/senhaHash-invalida.error";

export class SenhaHash {
    private readonly _valor: string;

    private constructor(senhaHash: string) {
        this._valor = senhaHash;
    }

    static criar(valor: string): Result<SenhaHash> {
        const erros = SenhaHash.validar(valor);

        if (erros.length > 0) {
            return Result.falhar(new SenhaHashInvalidaError());
        }

        return Result.passar(new SenhaHash(valor));
    }

    static validar(valor: string): string[] {
        const erros: string[] = [];

        if (!valor || valor.trim().length === 0) {
            erros.push('O hash da senha é obrigatório.');
        }

        return erros;
    }

    get valor(): string {
        return this._valor;
    }
}