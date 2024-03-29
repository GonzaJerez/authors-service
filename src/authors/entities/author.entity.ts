import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  collection: 'authors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Author {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  last_name: string;

  @Prop()
  image_url: string;

  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: Number,
    default: 0,
  })
  total_posts: number;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
