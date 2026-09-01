export class RegistrarUsuarioInput{
    constructor(
        public readonly email: string,
        public readonly senha: string,
        public readonly nome: string,
    ){}
}