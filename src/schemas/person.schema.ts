import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { Name, NameSchema } from './name.schema';
import { HydratedDocument, Types } from 'mongoose';

// @Schema()
// export class Person {
//   @Prop([NameSchema])
//   name: Name[];
// }

// export const PersonSchema = SchemaFactory.createForClass(Person);

// export type PersonDocumentOverride = {
//   name: Types.DocumentArray<Name>;
// };

// export type PersonDocument = HydratedDocument<Person, PersonDocumentOverride>;

class Person {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Virtual({
    get: function (this: Person) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;
}
