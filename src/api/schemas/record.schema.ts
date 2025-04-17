import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true })
  category: RecordCategory;

  @Prop({ default: Date.now })
  created: Date;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false })
  mbid?: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.Array,
  })
  trackList?: Track[];
}

class Track {
  @Prop({ required: true })
  title: string;

  /**
   * This is the MusicBrainz Track Id - which is the relationship id between the Release and the Recording
   */
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  recordingMbid: string;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
