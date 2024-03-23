import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileModel } from './models/file.model';
import { S3Service } from './s3.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';

@ApiBearerAuth('jwt')
@ApiTags('storage')
@Controller('storage')
export class S3Controller {
  constructor(private readonly aws: S3Service) {}

  @ApiOkResponse({
    type: FileModel,
  })
  @ApiBody({
    description: 'File upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post(':bucket')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucket') bucket: string,
  ) {
    return this.aws.upload({ file, bucket });
  }

  @ApiOkResponse({
    type: FileModel,
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    type: FileModel,
  })
  @Get(':bucket/:id')
  async getLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bucket') bucket: string,
  ) {
    const candidate = await this.aws.file({ uuid: id, bucket });

    return candidate;
  }
}
