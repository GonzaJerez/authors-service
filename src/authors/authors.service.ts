import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Author } from './entities/author.entity';
import { Model } from 'mongoose';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>,
  ) {}

  async create(body: CreateAuthorDto) {
    const author = new this.authorModel(body);
    return this.authorModel.create(author);
  }

  async findAll(filters: AuthorFilterDto): Promise<Author[]> {
    const idsPosts = filters.posts?.split(',');

    const query = {};

    if (idsPosts.length > 0) {
      query['posts'] = { $in: idsPosts };
    }
    return this.authorModel.find(query).lean();
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  // async seed(): Promise<Author[]> {
  //   await this.deleteAuthors();

  //   const authors: Author[] = [];

  //   authorsMocks.forEach((author) => {
  //     const authorCreated = new this.authorModel(author);
  //     authors.push(authorCreated);
  //   });

  //   return this.authorModel.insertMany(authors);
  // }
}
