import { SenhaHash } from "@users/domain/value-objects/senhaHash";
import { Result } from "@shared/domain/value-objects/result";

export interface IServicoCriptografia {
    criptografar(valor: string): Promise<string>;
    comparar(valor: string, hash: string): Promise<boolean>;
}