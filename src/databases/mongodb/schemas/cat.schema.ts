import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<List>;

@Schema()
export class List {
  @Prop({
    unique: true,
    index: true,
    required: true,
  })
  id: string;
  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(List);
