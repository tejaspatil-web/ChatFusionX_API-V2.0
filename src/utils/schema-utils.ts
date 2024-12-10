import { Schema } from 'mongoose';

export function applyCommonSchemaTransformations(schema: Schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    },
  });

  schema.set('toObject', {
    versionKey: false,
  });
}
