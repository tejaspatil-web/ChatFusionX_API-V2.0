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

    // Array of user IDs who have sent requests to this user
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    requests: Types.ObjectId[];
  
    // Array of user IDs added by this user
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    addedUsers: Types.ObjectId[];

      // Array of user IDs to whom this user has sent requests (pending approval)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  requestPending: Types.ObjectId[];

}

export const UserSchema = SchemaFactory.createForClass(User);

applyCommonSchemaTransformations(UserSchema);
