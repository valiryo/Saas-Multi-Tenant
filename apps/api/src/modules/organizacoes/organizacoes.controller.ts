import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { TipoCargo, type VinculoEmpregaticioPublico } from "@saas/shared";
import type { TokenPayload } from "@saas/usuarios";
import { CurrentUser } from "../auth/infrastructure/decorators/current-user.decorator";
import { RequerCargo } from "../auth/infrastructure/decorators/requer-cargo.decorator";
import { VinculoAtual } from "../auth/infrastructure/decorators/vinculo-atual.decorator";
import { CriarOrganizacaoCommand } from "./infrastructure/cqrs/criar-organizacao.command";
import { AdicionarMembroCommand } from "./infrastructure/cqrs/adicionar-membro.command";
import { AlterarCargoDoMembroCommand } from "./infrastructure/cqrs/alterar-cargo-do-membro.command";
import { RemoverMembroCommand } from "./infrastructure/cqrs/remover-membro.command";
import { ListarMembrosDaOrganizacaoQuery } from "./infrastructure/cqrs/listar-membros-da-organizacao.query";
import { ListarMinhasOrganizacoesQuery } from "./infrastructure/cqrs/listar-minhas-organizacoes.query";

const CARGOS_VALIDOS = Object.values(TipoCargo);

// Todas as rotas exigem autenticação: o AuthGuard é global e nenhuma delas é @Public().
// As rotas de uma organização específica exigem cargo nela (@RequerCargo): é o CargoGuard
// que centraliza essa verificação, e os casos de uso confiam nela.
// O cargo verificado chega aos casos de uso por @VinculoAtual(), sem nova consulta ao banco.
@Controller('organizacoes')
export class OrganizacoesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async criar(@Body() body: any, @CurrentUser() usuario: TokenPayload) {
        const { nome, slug } = body ?? {};
        if (typeof nome !== 'string' || !nome.trim()) {
            throw new BadRequestException('Nome é obrigatório');
        }
        if (slug !== undefined && typeof slug !== 'string') {
            throw new BadRequestException('Slug deve ser um texto');
        }

        const result = await this.commandBus.execute(new CriarOrganizacaoCommand(nome, usuario.sub, slug));
        if (result.isFalha) throw result.falha

        return result.resultado;
    }

    @Get()
    async listarMinhas(@CurrentUser() usuario: TokenPayload) {
        const result = await this.queryBus.execute(new ListarMinhasOrganizacoesQuery(usuario.sub));
        if (result.isFalha) throw result.falha

        return result.resultado;
    }

    // A lista traz e-mails e membros desativados: só a administração da organização vê
    @RequerCargo(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR)
    @Get(':organizacaoId/membros')
    async listarMembros(@Param('organizacaoId') organizacaoId: string) {
        const result = await this.queryBus.execute(new ListarMembrosDaOrganizacaoQuery(organizacaoId));
        if (result.isFalha) throw result.falha

        return result.resultado;
    }

    @RequerCargo(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR)
    @Post(':organizacaoId/membros')
    @HttpCode(HttpStatus.CREATED)
    async adicionarMembro(@Param('organizacaoId') organizacaoId: string, @Body() body: any) {
        const { email, cargo } = body ?? {};
        if (typeof email !== 'string' || !email.trim()) {
            throw new BadRequestException('Email é obrigatório');
        }

        const cmd = new AdicionarMembroCommand(organizacaoId, email.trim(), this.converterCargo(cargo));
        const result = await this.commandBus.execute(cmd);
        if (result.isFalha) throw result.falha

        return result.resultado;
    }

    @RequerCargo(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR)
    @Patch(':organizacaoId/membros/:usuarioId')
    async alterarCargoDoMembro(
        @Param('organizacaoId') organizacaoId: string,
        @Param('usuarioId') membroUsuarioId: string,
        @Body() body: any,
        @VinculoAtual() vinculo: VinculoEmpregaticioPublico,
    ) {
        const { cargo } = body ?? {};

        const cmd = new AlterarCargoDoMembroCommand(vinculo.tipoCargo, organizacaoId, membroUsuarioId, this.converterCargo(cargo));
        const result = await this.commandBus.execute(cmd);
        if (result.isFalha) throw result.falha

        return result.resultado;
    }

    @RequerCargo(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR)
    @Delete(':organizacaoId/membros/:usuarioId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removerMembro(
        @Param('organizacaoId') organizacaoId: string,
        @Param('usuarioId') membroUsuarioId: string,
        @VinculoAtual() vinculo: VinculoEmpregaticioPublico,
    ) {
        const result = await this.commandBus.execute(new RemoverMembroCommand(vinculo.tipoCargo, organizacaoId, membroUsuarioId));
        if (result.isFalha) throw result.falha
    }

    private converterCargo(cargo: unknown): TipoCargo {
        if (!CARGOS_VALIDOS.includes(cargo as TipoCargo)) {
            throw new BadRequestException(`Cargo deve ser um de: ${CARGOS_VALIDOS.join(', ')}`);
        }
        return cargo as TipoCargo;
    }
}
