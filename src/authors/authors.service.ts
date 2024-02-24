import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, Model } from 'mongoose';

import { Author } from './entities/author.entity';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { IPost } from './types/posts.types';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>,
    private readonly configService: ConfigService,
  ) {}

  async create(body: CreateAuthorDto) {
    const author = new this.authorModel(body);
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
      const resp: {
        statusCode?: number;
        message?: string;
        posts?: IPost[];
      } = await fetch(
        `${this.configService.get('POSTS_API_URL')}?authors=${authorsIds.join(
          ',',
        )}`,
      ).then((res) => res.json());

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
}
