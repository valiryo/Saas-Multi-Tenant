import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Get } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RegistrarUsuarioCommand } from "./infrastructure/cqrs/registrar-usuario.command";
import { Usuario } from "@saas/usuarios";
import { Result } from "@saas/shared";
import { Public } from "../auth/infrastructure/decorators/public-route.decorator";
import { DomainToHttpMapper } from "@shared/infrastructure/mappers/domain-to-http.mapper";

@Controller('usuarios')
export class UsuariosController{
    constructor(private readonly commandBus: CommandBus){}

    @Public()
    @Post('registrar')
    @HttpCode(HttpStatus.CREATED)
    async registrar(@Body() body: any){
        const {email, senha, nome} = body;
        if(!email || !senha || !nome) return new BadRequestException("Email, Nome e Senha são Obrigatórios");

        const cmd = new RegistrarUsuarioCommand(email, senha, nome);
        const result = await this.commandBus.execute(cmd);

        if(result.isFalha) throw result.falha

        return result.resultado;
    }
}