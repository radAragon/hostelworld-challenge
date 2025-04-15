import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';

@Controller('records')
export class RecordController {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDTO): Promise<Record> {
    return await this.recordModel.create({
      artist: request.artist,
      album: request.album,
      price: request.price,
      qty: request.qty,
      format: request.format,
      category: request.category,
      mbid: request.mbid,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({ status: 500, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<Record> {
    const record = await this.recordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    Object.assign(record, updateRecordDto);

    const updated = await this.recordModel.updateOne(record);
    if (!updated) {
      throw new InternalServerErrorException('Failed to update record');
    }

    return record;
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: [Record],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records per page',
    type: Number,
    default: 10,
  })
  async findAll(
    @Query('q') q?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('format') format?: RecordFormat,
    @Query('category') category?: RecordCategory,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Record[]> {
    let query = this.recordModel.find();

    if (q) {
      query = query.or([
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ]);
    } else {
      query = query.find({
        ...(artist ? { artist: { $regex: artist, $options: 'i' } } : {}),
        ...(album ? { album: { $regex: album, $options: 'i' } } : {}),
        ...(format ? { format: { $regex: format, $options: 'i' } } : {}),
        ...(category ? { category: { $regex: category, $options: 'i' } } : {}),
      });
    }

    query = query.limit(limit).skip((page - 1) * limit);

    return query.exec();
  }
}
