import { Module } from '@nestjs/common';
import { AuthorsModule } from './authors/authors.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [AuthorsModule, DatabaseModule, ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
