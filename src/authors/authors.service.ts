import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, Model } from 'mongoose';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { Author } from './entities/author.entity';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { IPost } from './types/posts.types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>,
    private readonly configService: ConfigService,
  ) {}

  async create(body: CreateAuthorDto, file?: Express.Multer.File) {
    const author = new this.authorModel(body);

    if (file) {
      const { url } = await this.uploadImage(file);
      author.image_url = url;
    }

    return this.authorModel.create(author);
  }

  async findAll(filters: AuthorFilterDto): Promise<Author[]> {
    const { authors: authors_ids, relations } = filters;

    // Filter authors by ids from request
    const idsAuthors = authors_ids?.split(',');
    const query: FilterQuery<Author> = {};
    if (idsAuthors?.length > 0) {
      query['_id'] = { $in: idsAuthors };
    }

    let authors: Author[] = await this.authorModel.find(query).lean();

    if (relations?.includes('posts')) {
      authors = await this.addPostsDataToAuthors(authors);
    }

    return authors;
  }

  private async addPostsDataToAuthors(authors: Author[]): Promise<Author[]> {
    // Get ids of authors to filter posts on fetch
    const authorsIds: string[] = authors.map((author) => author._id.toString());

    // Get data from posts microservice
    let posts: IPost[] = [];
    try {
      let resp: {
        statusCode?: number;
        message?: string;
        posts?: IPost[];
      };
      if (this.configService.get('NODE_ENV') === 'prod') {
        resp = await this.invokeLambda(`authors=${authorsIds.join(',')}`);
      } else {
        resp = await fetch(
          `${this.configService.getOrThrow(
            'POSTS_API_URL',
          )}?authors=${authorsIds.join(',')}`,
        ).then((res) => res.json());
      }
      if (!resp.posts)
        throw new InternalServerErrorException(
          'Error on get data from authors microservice',
        );

      posts = resp.posts;
    } catch (error) {
      console.log(error);
    }

    // If not recover data from posts microservice just return authors
    if (posts.length === 0) return authors;

    // Merge authors with their posts
    const authorsWithPosts: Author[] = authors.map((author) => {
      const postsByAuthor = posts.filter(
        (post) => post.author === author._id.toString(),
      );
      return {
        ...author,
        posts: postsByAuthor,
      };
    });

    return authorsWithPosts;
  }

  private async invokeLambda(queryString = '') {
    const queryStringParameters: Record<string, string> = {};

    const params = queryString.split('&');
    for (const param of params) {
      const [key, value] = param.split('=');
      queryStringParameters[key] = value;
    }

    const client = new LambdaClient();
    const command = new InvokeCommand({
      FunctionName: this.configService.getOrThrow('POSTS_FUNCTION_NAME'),
      Payload: JSON.stringify({
        version: '2.0',
        routeKey: '$default',
        rawPath: '/posts',
        rawQueryString: queryString,
        queryStringParameters,
        headers: {},
        requestContext: {
          http: {
            method: 'GET',
            path: `/posts?${queryString}`,
            protocol: 'HTTP/1.1',
          },
        },
      }),
      InvocationType: 'RequestResponse',
    });

    const resp = await client.send(command);
    const data = Buffer.from(resp.Payload).toString();
    const dataParsed = JSON.parse(data);
    return JSON.parse(dataParsed.body);
  }

  private async uploadImage(file: Express.Multer.File) {
    const client = new S3Client({
      region: this.configService.get('AWS_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
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
}
