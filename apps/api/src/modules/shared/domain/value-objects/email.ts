import { EmailInvalidoError } from "../errors/email-invalido";
import { Result } from "./result";

export class Email {
    private readonly _valor: string;
    private constructor(valor: string) {
        this._valor = valor;
    }

    static criar(valor: string): Result<Email> {
        const emailResult = Email.validarEmail(valor);
        if (emailResult.isFalha) {
            return Result.falhar(emailResult.falha);
        }
        return Result.passar(new Email(valor));
    }

    private static validarEmail(email: string): Result<true> {
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailValido = regexEmail.test(email);
        if(!emailValido){
            return Result.falhar(new EmailInvalidoError(email));
        }
        return Result.passar(true);
    }

    get valor(): string {
        return this._valor;
    }
}