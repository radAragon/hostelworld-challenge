import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { Order } from '../schemas/order.schema';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { OrderService } from '../services/order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let recordModel;
  let orderModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        {
          provide: getModelToken('Record'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('Order'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            create: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              withTransaction: jest.fn().mockImplementation((fn) => fn()),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
    orderModel = module.get<Model<Order>>(getModelToken('Order'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new order', async () => {
    const createOrderDto: CreateOrderRequestDTO = {
      recordId: '1',
      qty: 1,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 10,
      save: jest.fn(),
    };

    const savedOrder = {
      _id: '123',
      qty: 1,
      record: '1',
      populate: jest.fn().mockReturnThis(),
    };

    jest.spyOn(recordModel, 'findById').mockResolvedValue(savedRecord as any);
    jest.spyOn(orderModel, 'create').mockResolvedValue([savedOrder] as any);

    const result = await controller.create(createOrderDto);
    expect(result).toMatchObject({
      _id: '123',
      qty: 1,
    });
    expect(orderModel.create).toHaveBeenCalledWith(
      [
        {
          qty: 1,
          record: '1',
        },
      ],
      { session: expect.anything() },
    );
    expect(savedRecord.save).toHaveBeenCalled();
  });

  it('should throw BadRequestException when record is not found', async () => {
    const createOrderDto: CreateOrderRequestDTO = {
      recordId: 'non-existent',
      qty: 1,
    };

    jest.spyOn(recordModel, 'findById').mockResolvedValue(null);

    await expect(controller.create(createOrderDto)).rejects.toThrow(
      'Record not found',
    );
    expect(recordModel.findById).toHaveBeenCalledWith('non-existent');
    expect(orderModel.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when not enough records in stock', async () => {
    const createOrderDto: CreateOrderRequestDTO = {
      recordId: '1',
      qty: 2,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 1,
      save: jest.fn(),
    };

    jest.spyOn(recordModel, 'findById').mockResolvedValue(savedRecord as any);

    await expect(controller.create(createOrderDto)).rejects.toThrow(
      'Not enough records in stock',
    );
    expect(recordModel.findById).toHaveBeenCalledWith('1');
    expect(orderModel.create).not.toHaveBeenCalled();
  });
});
