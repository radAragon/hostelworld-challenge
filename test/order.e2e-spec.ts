import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RecordFormat, RecordCategory } from '../src/api/schemas/record.enum';
import { CreateRecordRequestDTO } from 'src/api/dtos/create-record.request.dto';
import { CreateOrderRequestDTO } from 'src/api/dtos/create-order.request.dto';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let recordId: string;
  let orderId: string;
  let recordModel;
  let orderModel;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    recordModel = app.get('RecordModel');
    orderModel = app.get('OrderModel');
    await app.init();
  });

  // Test to create an order with given record id
  it('should create a new order', async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const record = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = record.body._id;

    const createOrderDto: CreateOrderRequestDTO = {
      recordId,
      qty: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    orderId = response.body._id;

    expect(response.body).toHaveProperty('qty', 1);
    expect(response.body).toHaveProperty('record');
    expect(response.body.record).toHaveProperty('qty', 9);
  });

  afterEach(async () => {
    if (recordId) {
      await recordModel.findByIdAndDelete(recordId);
    }

    if (orderId) {
      await orderModel.findByIdAndDelete(orderId);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
