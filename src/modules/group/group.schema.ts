import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

@Schema({ timestamps: true })
export class Group {
    @Prop({ required: true })
    name: string;
  
    @Prop({default:""})
    description: string;

    // Array of User IDs who are admins of the group
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    admins: Types.ObjectId[];
  
    // Array of User IDs who are members of the group
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    members: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// applyCommonSchemaTransformations(UserSchema);
