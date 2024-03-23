import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { FileModel } from './models/file.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as AWS from 'aws-sdk';

@Injectable({ scope: Scope.DEFAULT })
export class S3Service {
  private readonly endpoint: string;
  private readonly s3: AWS.S3;
  private readonly bucketAlias = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.endpoint = process.env.S3_ENDPOINT; //'http://localhost:9000'

    this.bucketAlias.set('images', process.env.S3_IMAGES);
    this.bucketAlias.set('tasks', process.env.S3_TASKS);

    this.s3 = new AWS.S3({
      apiVersion: 'latest',
      endpoint: this.endpoint,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      hostPrefixEnabled: false,
      s3ForcePathStyle: true,
    });
  }

  async upload(params: {
    file: Express.Multer.File;
    bucket: string;
  }): Promise<FileModel> {
    const { file, bucket } = params;

    if (!bucket || bucket.length == 0) {
      throw new HttpException('Invalid bucket', HttpStatus.BAD_REQUEST);
    }

    if (!file || file.size == 0) {
      throw new HttpException('Invalid file', HttpStatus.BAD_REQUEST);
    }

    const uuid = randomUUID();

    let url: string;

    try {
      const s3Upload = await this.s3
        .upload({
          Bucket: this.bucketAlias.get(bucket),
          Key: uuid,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
        })
        .promise();

      url = s3Upload.Location;
    } catch (e) {
      console.log(e);
      return {
        title: file.originalname,
        type: file.mimetype,
        uploaded: false,
        url: null,
        id: uuid,
      };
    }

    const db = await this.prisma.file.create({
      data: {
        id: uuid,
        type: file.mimetype,
        original_name: file.originalname,
        url, //`${this.endpoint}/${this.bucket}/${id}`,
        bucket: bucket,
      },
    });

    return {
      id: db.id,
      title: db.original_name,
      uploaded: true,
      url: db.url,
      type: db.type,
    };
  }

  async file(params: { uuid: string; bucket: string }): Promise<FileModel> {
    const { bucket, uuid } = params;

    const candidate = await this.prisma.file.findFirst({
      where: {
        id: uuid,
        bucket: bucket,
      },
    });

    if (candidate == null) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: candidate.id,
      title: candidate.original_name,
      uploaded: true,
      url: candidate.url,
      type: candidate.type,
    };
  }
}
