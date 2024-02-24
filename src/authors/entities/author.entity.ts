import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { IPost } from '../types/posts.types';

@Schema({
  collection: 'authors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Author {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  last_name: string;

  posts?: IPost[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
