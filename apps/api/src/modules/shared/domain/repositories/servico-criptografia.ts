import { SenhaHash } from "@users/domain/value-objects/senhaHash";
import { Result } from "@shared/domain/value-objects/result";

export interface ServicoCriptografia {
    criptografar(valor: string): Promise<Result<SenhaHash>>;
    comparar(valor: string, hash: string): Promise<Result<boolean>>;
}