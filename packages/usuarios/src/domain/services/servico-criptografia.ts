import { SenhaHash } from "../value-objects/senhaHash";
import { Result } from "@saas/shared";

export interface IServicoCriptografia {
    criptografar(valor: string): Promise<string>;
    comparar(valor: string, hash: string): Promise<boolean>;
}