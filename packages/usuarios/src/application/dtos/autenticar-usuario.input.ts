export class AutenticarUsuarioInput {
    constructor(
        public readonly email: string,
        public readonly senha: string,
    ){}
}