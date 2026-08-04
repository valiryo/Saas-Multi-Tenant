import { SenhaForte } from "./senhaForte";
import { ServicoCriptografia } from "../../../shared/domain/repositories/servico-criptografia";

export class SenhaHash {
    private readonly _valor: string;

    private constructor(senhaHash: string) {
        this._valor = senhaHash;
    }

    static criar(senhaHash: string) {
        return new SenhaHash(senhaHash);
    }

    get valor(): string {
        return this._valor;
    }
}