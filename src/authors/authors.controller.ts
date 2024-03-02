import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorsService } from './authors.service';
import { AuthorFilterDto } from './dto/author-filter.dto';
import { CreateAuthorDto } from './dto/create-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() body: CreateAuthorDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          // In kb
          new MaxFileSizeValidator({ maxSize: 1024 * 250 }),
          new FileTypeValidator({ fileType: 'jpeg|jpg|png' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.authorsService.create(body, file);
  }

  @Get()
  async findAll(@Query() filters: AuthorFilterDto) {
    const authors = await this.authorsService.findAll(filters);
    return { authors };
  }
}
