import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RegistrarUsuarioCommand } from "./infrastructure/cqrs/registrar-usuario.command";
import { Public } from "../auth/infrastructure/decorators/public-route.decorator";

@Controller('usuarios')
export class UsuariosController{
    constructor(private readonly commandBus: CommandBus){}

    @Public()
    @Post('registrar')
    @HttpCode(HttpStatus.CREATED)
    async registrar(@Body() body: any){
        const {email, senha, nome} = body ?? {};
        if(!email || !senha || !nome) throw new BadRequestException("Email, Nome e Senha são Obrigatórios");

        const cmd = new RegistrarUsuarioCommand(email, senha, nome);
        const result = await this.commandBus.execute(cmd);

        if(result.isFalha) throw result.falha

        return result.resultado;
    }
}
