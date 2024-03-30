import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as bcrypt from 'bcryptjs';

import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { IPost, TypeOperation } from './types/post-message';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>,
    private readonly configService: ConfigService,
  ) {}

  async create(body: CreateAuthorDto, file?: Express.Multer.File) {
    const author = new this.authorModel({
      ...body,
      password: bcrypt.hashSync(body.password, 10),
    });

    if (file) {
      const { url } = await this.uploadImage(file);
      author.image_url = url;
    }

    const authorCreated = await this.authorModel.create(author);

    await this.notifyChangeAuthors([authorCreated], 'CREATE');

    return authorCreated;
  }

  async findAll(): Promise<Author[]> {
    return this.authorModel.find().lean();
  }

  private async uploadImage(file: Express.Multer.File) {
    const client = new S3Client({
      region: this.configService.get('AWS_BUCKET_REGION'),
    });

    // Remove spaces from file name to url
    const formatedFileName = file.originalname.replace(/\s/g, '-');

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: formatedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const uploadResponse = await client.send(command);

    // Generate url because s3 not generate in response
    const url = `https://${this.configService.get(
      'AWS_BUCKET_NAME',
    )}.s3.${this.configService.get(
      'AWS_BUCKET_REGION',
    )}.amazonaws.com/${formatedFileName}`;

    return {
      ...uploadResponse,
      url,
    };
  }

  async handleMessage(operation: TypeOperation, post: IPost) {
    let increment = 0;

    if (operation === 'CREATE') increment += 1;
    if (operation === 'DELETE') increment -= 1;

    await this.authorModel.findByIdAndUpdate(
      post.author,
      {
        $inc: {
          total_posts: increment,
        },
      },
      { new: true },
    );
  }

  async notifyChangeAuthors(
    authors: Author[],
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
  ) {
    const client = new SNSClient({});
    const fifoId = crypto.randomUUID();
    const command = new PublishCommand({
      Message: JSON.stringify(authors),
      TopicArn: this.configService.get('SNS_TOPIC_ARN'),
      MessageAttributes: {
        operation: {
          DataType: 'String',
          StringValue: operation,
        },
      },
      MessageGroupId: fifoId,
      MessageDeduplicationId: fifoId,
    });

    await client.send(command);
  }
}
