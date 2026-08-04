import { DomainError } from "../errors/erro-de-dominio";

export class Result<T, E extends DomainError = DomainError> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    private readonly _error?: E;
    private readonly _value?: T;

    private constructor(isSuccess: boolean, error?: E, value?: T) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this._error = error;
        this._value = value;
    }

    public static ok<U>(value: U): Result<U> {
        return new Result<U, any>(true, undefined, value);
    }

    public static fail<F extends DomainError>(error: F): Result<any, F> {
        return new Result<any, F>(false, error);
    }

    get error(): E {
        if (this.isSuccess) {
            throw new Error("Não é possível acessar o erro de um resultado bem-sucedido.");
        }
        return this._error!;
    }

    get value(): T {
        if (this.isFailure) {
            throw new Error("Não é possível acessar o valor de um resultado falho.");
        }
        return this._value!;
    }
}