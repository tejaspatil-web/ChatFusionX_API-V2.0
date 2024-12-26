import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

@Schema({_id:false})
export class Message{
    @Prop({type:Types.ObjectId,ref:'User'})
    userId:Types.ObjectId

    @Prop({type:String,required:true})
    userName:string

    @Prop({type:String,required:true})
    message:string

    @Prop({type:String,required:true})
    time:string
}

@Schema({ timestamps: true })
export class Group {
    @Prop({ required: true })
    name: string;
  
    @Prop({default:""})
    description: string;

    @Prop({type:[Message],default:[]})
    messages: Message[];

    // Array of User IDs who are admins of the group
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    admins: Types.ObjectId[];
  
    // Array of User IDs who are members of the group
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    members: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// applyCommonSchemaTransformations(UserSchema);
