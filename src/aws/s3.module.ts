import { Module } from '@nestjs/common';
import { S3Service as S3Service } from './s3.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Controller } from './s3.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [S3Service],
  exports: [S3Service],
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [S3Controller],
})
export class S3Module {}
