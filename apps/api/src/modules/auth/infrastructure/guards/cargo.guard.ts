import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import { TipoCargo } from '@saas/shared';
import { TokenPayload } from '@saas/usuarios';
import { VerificarCargoNaOrganizacaoQuery } from '@organizacoes/infrastructure/cqrs/verificar-cargo-na-organizacao.query';

export const CARGOS_PERMITIDOS_KEY = "CargosPermitidos";

/** Parâmetro de rota de onde o guard lê a organização: `/organizacoes/:organizacaoId/...` */
export const PARAMETRO_ORGANIZACAO = "organizacaoId";

/** Propriedade da request onde o guard guarda o vínculo verificado. */
export const VINCULO_ATUAL_KEY = "vinculo";

/**
 * Restringe a rota a quem tem vínculo ativo, com um dos cargos exigidos, na organização da URL.
 * Não é usado diretamente: aplique com `@RequerCargo(...)` ou `@RequerMembro()`.
 * Roda depois do AuthGuard (global), que já populou `request.user`.
 */
@Injectable()
export class CargoGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly queryBus: QueryBus,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const cargosPermitidos = this.reflector.getAllAndOverride<TipoCargo[] | undefined>(CARGOS_PERMITIDOS_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!cargosPermitidos?.length) return true;

        const request = context.switchToHttp().getRequest();
        const usuario: TokenPayload | undefined = request['user'];
        if (!usuario) throw new UnauthorizedException()

        const organizacaoId: string | undefined = request.params?.[PARAMETRO_ORGANIZACAO];
        if (!organizacaoId) {
            // Erro de configuração da rota, não do usuário: vira 500 no GlobalExceptionFilter
            throw new Error(`Rota protegida por cargo sem o parâmetro :${PARAMETRO_ORGANIZACAO}`);
        }

        // Cargo consultado no banco a cada request, e não no token: promoções, rebaixamentos e remoções valem na hora
        const vinculoResult = await this.queryBus.execute(
            new VerificarCargoNaOrganizacaoQuery(usuario.sub, organizacaoId, cargosPermitidos)
        )
        if (vinculoResult.isFalha) throw vinculoResult.falha

        // Disponível via @VinculoAtual(): os casos de uso recebem o cargo já verificado, sem consultar de novo
        request[VINCULO_ATUAL_KEY] = vinculoResult.resultado;

        return true;
    }
}
