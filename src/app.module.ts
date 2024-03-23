import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './aws/s3.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    S3Module,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'swagger'),
      serveStaticOptions: {},
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
