import type { Prisma } from "database";

import { Email, Id, NomeDePessoa, Result } from "@saas/shared";

import { Usuario, SenhaHash } from "@saas/usuarios";

export type PrismaUsuarioSchema =
  Prisma.UsuarioGetPayload<{}>;

export class PrismaUsuarioMapper {
  public static paraDominio(
    dadosPrisma: PrismaUsuarioSchema,
  ): Result<Usuario> {
    const id = Id.criar(dadosPrisma.id);

    if (id.isFalha) {
      return Result.falhar(id.falha);
    }

    const email = Email.criar(dadosPrisma.email);

    if (email.isFalha) {
      return Result.falhar(email.falha);
    }

    const senhaHash = SenhaHash.criar(
      dadosPrisma.senhaHash,
    );

    if (senhaHash.isFalha) {
      return Result.falhar(senhaHash.falha);
    }

    const nome = NomeDePessoa.criar(
      dadosPrisma.nome,
    );

    if (nome.isFalha) {
      return Result.falhar(nome.falha);
    }

    return Usuario.criar({
      id: id.resultado,
      email: email.resultado,
      senhaHash: senhaHash.resultado,
      nome: nome.resultado,
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