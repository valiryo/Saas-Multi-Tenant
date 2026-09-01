import { Result } from "@saas/shared";
import { SenhaForteInvalidaError } from "../errors/senhaForte-invalida.error";

export class SenhaForte {
    private readonly _valor: string;    
    private constructor(valor: string) {
        this._valor = valor;
    }

    static criar(valor: string): Result<SenhaForte> {
        const erros = SenhaForte.validar(valor);

        if (erros.length > 0) {
            return Result.falhar(new SenhaForteInvalidaError(erros.join(', ')));
        }

        return Result.passar(new SenhaForte(valor));
    }

    static validar(valor: string): string[] {
        const erros: string[] = [];

        if (!valor) {
            erros.push('senha obrigatória');
            return erros;
        }

        if (!/^.{8,128}$/.test(valor)) {
            erros.push('deve ter entre 8 e 128 caracteres');
        }

        if (!/[a-z]/.test(valor)) {
            erros.push('deve conter pelo menos uma letra minúscula');
        }

        if (!/[A-Z]/.test(valor)) {
            erros.push('deve conter pelo menos uma letra maiúscula');
        }

        if (!/\d/.test(valor)) {
            erros.push('deve conter pelo menos um número');
        }

        if (!/[^A-Za-z0-9]/.test(valor)) {
            erros.push('deve conter pelo menos um caractere especial');
        }

        if (/\s/.test(valor)) {
            erros.push('não deve conter espaços');
        }

        return erros;
    }

    get valor(): string {
        return this._valor;
    }
}