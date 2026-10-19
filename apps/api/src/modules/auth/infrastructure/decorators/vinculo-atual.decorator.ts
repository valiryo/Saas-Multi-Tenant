import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { VinculoEmpregaticioPublico } from "@saas/shared";
import { VINCULO_ATUAL_KEY } from "../guards/cargo.guard";

/**
 * Vínculo do usuário autenticado com a organização da rota, já verificado pelo CargoGuard
 * nesta mesma request (consultado no banco, não lido do token).
 * Só pode ser usado em rotas com `@RequerCargo(...)` ou `@RequerMembro()`.
 */
export const VinculoAtual = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): VinculoEmpregaticioPublico => {
        const vinculo = ctx.switchToHttp().getRequest()[VINCULO_ATUAL_KEY];
        if (!vinculo) {
            // Erro de configuração da rota, não do usuário: vira 500 no GlobalExceptionFilter
            throw new Error("@VinculoAtual() usado em rota sem @RequerCargo/@RequerMembro");
        }
        return vinculo;
    }
)
