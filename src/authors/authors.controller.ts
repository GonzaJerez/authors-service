import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  create(@Body() body: CreateAuthorDto) {
    return this.authorsService.create(body);
  }

  @Get()
  findAll(@Query() filters: AuthorFilterDto) {
    return this.authorsService.findAll(filters);
  }
}
