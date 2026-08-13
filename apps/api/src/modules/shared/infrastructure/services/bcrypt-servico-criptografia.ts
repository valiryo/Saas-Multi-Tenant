import * as bcrypt from "bcrypt";
import { ServicoCriptografia } from "@shared/domain/services/servico-criptografia";

export class BcryptServicoCriptografia implements ServicoCriptografia {
    private readonly SALT_ROUNDS = 10;

    async criptografar(valor: string): Promise<string> {
        return bcrypt.hash(valor, this.SALT_ROUNDS);
    }

    async comparar(valor: string, hash: string): Promise<boolean> {
        return bcrypt.compare(valor, hash);
    }
}