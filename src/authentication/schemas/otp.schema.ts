import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyCommonSchemaTransformations } from 'src/utils/schema-utils';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date; // CreatedAt will automatically be set to the current date and time

  @Prop({ expires: '5m', default: Date.now }) // Expire the document 10 minutes after creation
  expireAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

applyCommonSchemaTransformations(OtpSchema);
