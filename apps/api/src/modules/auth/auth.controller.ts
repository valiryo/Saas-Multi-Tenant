import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, Body } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { AutenticarUsuarioComando } from "@users/application/dtos/autenticar-usuario.comando";
import { TokenPayload } from "./application/interfaces/jwt-payload";
import { Result } from "@shared/domain/value-objects/result";
import { Usuario } from "@users/domain/entities/usuario.entidade";
import { UsuarioAutenticadoDto } from "@users/application/dtos/usuario-autenticado.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly jwtService: JwtService
    ) { }

    @Post("login")
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() body: any) {
        const { email, senha } = body;
        if (!email || !senha) {
            throw new BadRequestException('Email e senha são obrigatórios');
        }

        const cmd = new AutenticarUsuarioComando(email, senha);
        const result = await this.commandBus.execute<AutenticarUsuarioComando, Result<UsuarioAutenticadoDto>>(cmd);

        if (result.isFalha) {
            throw new UnauthorizedException(result.falha.message);
        }

        const usuarioAutenticado: UsuarioAutenticadoDto = result.resultado;

        const payload: TokenPayload = {
            sub: usuarioAutenticado.id,
            email: usuarioAutenticado.email,
            nome: usuarioAutenticado.nome
        }

        const accessToken = await this.jwtService.signAsync(payload)

        return {
            accessToken,
            usuarioAutenticado
        }

    }
}