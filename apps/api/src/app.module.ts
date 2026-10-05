import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';

import { apiConfig } from './config/api.config';
import { envValidationSchema } from './config/env.validation';

import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from '@users/usuarios.module';
import { APP_FILTER } from '@nestjs/core';
import { DomainExceptionFilter } from '@shared/infrastructure/filters/domain-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      envFilePath: join(__dirname, '../.env'),

      validationSchema: envValidationSchema,

      load: [apiConfig],
    }),

    AuthModule,
    UsuariosModule,
  ],
  providers: [
    {provide: APP_FILTER, useClass: DomainExceptionFilter}
  ]
})
export class AppModule {}