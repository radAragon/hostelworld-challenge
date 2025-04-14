import { Module } from '@nestjs/common';
import { RecordModule } from './api/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { RootController } from './root/root.controller';

@Module({
  imports: [MongooseModule.forRoot(AppConfig.mongoUrl), RecordModule],
  controllers: [RootController],
  providers: [],
})
export class AppModule {}
