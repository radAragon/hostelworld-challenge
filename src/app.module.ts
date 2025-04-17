import { Module } from '@nestjs/common';
import { RecordModule } from './api/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { MbrainzService } from './mbrainz/mbrainz.service';
import { OrderModule } from './api/order.module';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    RecordModule,
    OrderModule,
  ],
  controllers: [],
  providers: [MbrainzService],
})
export class AppModule {}
