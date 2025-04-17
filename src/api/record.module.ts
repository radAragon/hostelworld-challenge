import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './controllers/record.controller';
import { RecordService } from './services/record.service';
import { RecordSchema } from './schemas/record.schema';
import { MbrainzService } from '../mbrainz/mbrainz.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
  ],
  controllers: [RecordController],
  providers: [RecordService, MbrainzService],
})
export class RecordModule {}
