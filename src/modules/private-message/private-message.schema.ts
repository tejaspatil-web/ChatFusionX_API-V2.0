import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PrivateChatDocument = HydratedDocument<PrivateChat>;

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
export class PrivateChat {
    @Prop({ required: true })
    _id: string;

    @Prop({type:[Message],default:[]})
    messages: Message[];
}

export const PrivateChatSchema = SchemaFactory.createForClass(PrivateChat);

// applyCommonSchemaTransformations(UserSchema);
