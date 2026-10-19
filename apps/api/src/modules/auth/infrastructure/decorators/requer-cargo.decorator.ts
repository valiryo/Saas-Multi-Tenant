import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { TipoCargo } from "@saas/shared";
import { CARGOS_PERMITIDOS_KEY, CargoGuard } from "../guards/cargo.guard";

const protegerPorCargos = (cargos: readonly TipoCargo[]) =>
    applyDecorators(
        SetMetadata(CARGOS_PERMITIDOS_KEY, cargos),
        UseGuards(CargoGuard),
    )

/**
 * Exige que o usuário autenticado tenha, na organização do parâmetro `:organizacaoId`,
 * vínculo ativo com um dos cargos informados. Membro sem o cargo: 403. Quem não é membro
 * recebe 404, exista a organização ou não, para não revelar quais organizações existem.
 *
 * @example
 * @RequerCargo(TipoCargo.PROPRIETARIO, TipoCargo.ADMINISTRADOR)
 * @Post(':organizacaoId/membros')
 */
export const RequerCargo = (cargo: TipoCargo, ...outrosCargos: TipoCargo[]) =>
    protegerPorCargos([cargo, ...outrosCargos])

/** Exige vínculo ativo na organização do parâmetro `:organizacaoId`, com qualquer cargo. */
export const RequerMembro = () =>
    protegerPorCargos(Object.values(TipoCargo))
