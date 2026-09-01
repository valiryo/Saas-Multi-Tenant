import { Email } from "@saas/shared";

import { Usuario, IRepositorioUsuario } from "@saas/usuarios";

import {
  PrismaUsuarioMapper,
  type PrismaUsuarioSchema,
} from "../mappers/prisma-usuario.mapper";
import { PrismaService } from "src/modules/database/services/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaUsuarioAdapter
  implements IRepositorioUsuario
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public async buscarPorEmail(
    email: Email,
  ): Promise<Usuario | null> {
    const dadosPrisma =
      await this.prisma.usuario.findUnique({
        where: {
          email: email.valor,
        },
      });

    if (!dadosPrisma) {
      return null;
    }

    return this.converterParaDominio(
      dadosPrisma,
    );
  }

  public async salvar(
    usuario: Usuario,
  ): Promise<Usuario> {
    const dadosPersistencia =
      PrismaUsuarioMapper
        .paraPersistencia(usuario);

    const dadosPrisma =
      await this.prisma.usuario.upsert({
        where: {
          id: usuario.id.valor,
        },

        create: {
          id: dadosPersistencia.id,
          nome: dadosPersistencia.nome,
          email: dadosPersistencia.email,
          senhaHash:
            dadosPersistencia.senhaHash,
        },

        update: {
          nome: dadosPersistencia.nome,
          email: dadosPersistencia.email,
          senhaHash:
            dadosPersistencia.senhaHash,
        },
      });

    return this.converterParaDominio(
      dadosPrisma,
    );
  }

  private converterParaDominio(
    dadosPrisma: PrismaUsuarioSchema,
  ): Usuario {
    const resultado =
      PrismaUsuarioMapper
        .paraDominio(dadosPrisma);

    if (resultado.isFalha) {
      throw resultado.falha;
    }

    return resultado.resultado;
  }
}