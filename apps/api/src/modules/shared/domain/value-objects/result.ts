import { ErroDeDominio } from "../errors/erro-de-dominio";

export class Result<T, E extends ErroDeDominio = ErroDeDominio> {
    public readonly isSucesso: boolean;
    public readonly isFalha: boolean;
    private readonly _erro?: E;
    private readonly _valor?: T;

    private constructor(isSucesso: boolean, erro?: E, valor?: T) {
        this.isSucesso = isSucesso;
        this.isFalha = !isSucesso;
        this._erro = erro;
        this._valor = valor;
    }

    public static passar<U>(value: U): Result<U> {
        return new Result<U, any>(true, undefined, value);
    }

    public static falhar<F extends ErroDeDominio>(error: F): Result<any, F> {
        return new Result<any, F>(false, error);
    }

    get falha(): E {
        if (this.isSucesso) {
            throw new Error("Não é possível acessar o erro de um resultado bem-sucedido.");
        }
        return this._erro!;
    }

    get resultado(): T {
        if (this.isFalha) {
            throw new Error("Não é possível acessar o valor de um resultado falho.");
        }
        return this._valor!;
    }
}