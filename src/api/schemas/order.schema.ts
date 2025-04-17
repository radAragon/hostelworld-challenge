import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Record } from './record.schema';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  qty: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Record', required: true })
  record: Record;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
