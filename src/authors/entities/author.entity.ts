import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'authors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Author extends Document {
  @Prop()
  name: string;

  @Prop()
  last_name: string;

  @Prop({
    type: 'string',
  })
  posts: string[] | Post[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

export class Post {
  _id: string;
  title: string;
  author: string;
  body: string;
}
