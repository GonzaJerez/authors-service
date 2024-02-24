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
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
