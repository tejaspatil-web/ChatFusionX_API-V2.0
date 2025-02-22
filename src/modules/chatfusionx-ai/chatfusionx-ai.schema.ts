import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ChatFusionXAIDocument = HydratedDocument<ChatFusionXAI>;

@Schema({ _id: false, timestamps: true })
export class Message {
  @Prop({ type: [{ text: String }], required: true })
  parts: { text: string }[];

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: Date, default: Date.now })

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class ChatFusionXAI {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Message], default: [] })
  messages: Message[];
}

export const ChatFusionXAISchema = SchemaFactory.createForClass(ChatFusionXAI);
