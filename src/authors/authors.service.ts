import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Author } from './entities/author.entity';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>,
  ) {}

  async create(body: CreateAuthorDto) {
    const author = new this.authorModel(body);
    return this.authorModel.create(author);
  }

  async findAll(filters: AuthorFilterDto): Promise<Author[]> {
    const idsAuthors = filters.authors?.split(',');

    const query: FilterQuery<Author> = {};

    if (idsAuthors?.length > 0) {
      query._id = { $in: idsAuthors };
    }
    return this.authorModel.find(query).lean();
  }
}
