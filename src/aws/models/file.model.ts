import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FileModel {
  @IsUUID()
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  uploaded: boolean;

  @ApiProperty()
  url: string;
}
