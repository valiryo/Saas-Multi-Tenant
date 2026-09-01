import * as bcrypt from "bcrypt";
import { IServicoCriptografia } from "@saas/usuarios";

export class BcryptServicoCriptografia implements IServicoCriptografia {
    private readonly SALT_ROUNDS = 10;

    async criptografar(valor: string): Promise<string> {
        return bcrypt.hash(valor, this.SALT_ROUNDS);
    }

    async comparar(valor: string, hash: string): Promise<boolean> {
        return bcrypt.compare(valor, hash);
    }
}