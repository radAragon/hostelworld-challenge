import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Record } from '../schemas/record.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(request: CreateOrderRequestDTO): Promise<Order> {
    const record = await this.recordModel.findById(request.recordId);

    if (!record) {
      throw new BadRequestException('Record not found');
    }

    if (record.qty < request.qty) {
      throw new BadRequestException('Not enough records in stock');
    }

    console.log('Found record', record);

    let order: Order;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      record.qty -= request.qty;

      const [createdOrders] = await Promise.all([
        this.orderModel.create(
          [
            {
              qty: request.qty,
              record: request.recordId,
            },
          ],
          { session },
        ),
        record.save({ session }),
      ]);

      order = createdOrders[0];
    });

    return order.populate('record');
  }
}
