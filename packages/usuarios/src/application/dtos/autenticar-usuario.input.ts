export class AutenticarUsuarioInput {
    constructor(
        public readonly email: string,
        public readonly senha: string,
        public readonly ipAddress: string,
        public readonly userAgent: string
    ){}
}