import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Name {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export const NameSchema = SchemaFactory.createForClass(Name);
