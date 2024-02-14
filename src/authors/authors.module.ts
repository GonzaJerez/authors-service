import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from './entities/author.entity';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Author.name,
        schema: AuthorSchema,
      },
    ]),
  ],
})
export class AuthorsModule {}
