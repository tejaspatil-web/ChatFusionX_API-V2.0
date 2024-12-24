import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { applyCommonSchemaTransformations } from 'src/utils/schema-utils';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

 // Array of Group IDs where the user is an admin
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  adminGroupIds: Types.ObjectId[];

  // Array of Group IDs the user has joined
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  joinedGroupIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

applyCommonSchemaTransformations(UserSchema);
