import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';

import { BcryptServicoCriptografia } from '@users/infrastructure/services/bcrypt-servico-criptografia';
import { JwtServicoTokenAutenticacao } from '@users/infrastructure/services/jwt-token-servico-autenticacao';
import { PrismaUsuarioAdapter } from '@users/infrastructure/persistence/prisma/prisma-usuario.adapter';

import {
  REPOSITORIO_USUARIO_TOKEN,
  SERVICO_CRIPTOGRAFIA_TOKEN,
  SERVICO_AUTENTICACAO_TOKEN,
} from '@users/usuario.tokens';

import { apiConfig } from 'src/config/api.config';

import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [
    PrismaModule,

    ConfigModule.forFeature(apiConfig),

    JwtModule.register({}),

    DatabaseModule,
  ],

  providers: [
    {
      provide: REPOSITORIO_USUARIO_TOKEN,
      useClass: PrismaUsuarioAdapter,
    },

    {
      provide: SERVICO_CRIPTOGRAFIA_TOKEN,
      useClass: BcryptServicoCriptografia,
    },

    {
      provide: SERVICO_AUTENTICACAO_TOKEN,
      useClass: JwtServicoTokenAutenticacao,
    },
  ],

  exports: [
    REPOSITORIO_USUARIO_TOKEN,
    SERVICO_CRIPTOGRAFIA_TOKEN,
    SERVICO_AUTENTICACAO_TOKEN,
    JwtModule,
  ],
})
export class AdaptersModule {}