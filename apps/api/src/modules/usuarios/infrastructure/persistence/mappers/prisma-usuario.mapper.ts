import type { Prisma } from "database";

import { Result } from "@saas/shared";

import { Usuario } from "@saas/usuarios";

export type PrismaUsuarioSchema =
  Prisma.UsuarioGetPayload<{}>;

export class PrismaUsuarioMapper {
  public static paraDominio(
    dadosPrisma: PrismaUsuarioSchema,
  ): Result<Usuario> {
    return Usuario.criar({
      id: dadosPrisma.id,
      email: dadosPrisma.email,
      senhaHash: dadosPrisma.senhaHash,
      nome: dadosPrisma.nome,
    });
  }

  public static paraPersistencia(
    usuario: Usuario,
  ): Prisma.UsuarioUncheckedCreateInput {
    return {
      id: usuario.id.valor,
      nome: usuario.nome.nomeCompleto,
      email: usuario.email.valor,
      senhaHash: usuario.senhaHash.valor,
    };
  }
}