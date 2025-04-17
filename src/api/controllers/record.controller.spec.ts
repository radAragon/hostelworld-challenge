import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { RecordService } from '../services/record.service';
import { MbrainzService } from '../../mbrainz/mbrainz.service';

describe('RecordController', () => {
  let controller: RecordController;
  let recordModel: Model<Record>;
  let mbrainzService: MbrainzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        RecordService,
        MbrainzService,
        {
          provide: getModelToken('Record'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findById: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
    mbrainzService = module.get<MbrainzService>(MbrainzService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new record', async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 10,
    };

    jest.spyOn(recordModel, 'create').mockResolvedValue(savedRecord as any);

    const result = await controller.create(createRecordDto);
    expect(result).toEqual(savedRecord);
    expect(recordModel.create).toHaveBeenCalledWith({
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      category: RecordCategory.ALTERNATIVE,
      format: RecordFormat.VINYL,
    });
  });

  it('should create a new record with a new MusicBrainz mbid', async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
      mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
    };

    const savedRecord = {
      _id: '1',
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 100,
      qty: 10,
    };

    jest.spyOn(mbrainzService, 'lookupRelease').mockResolvedValue({
      id: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
      title: 'Abbey Road',
      media: [
        {
          tracks: [
            {
              recording: {
                id: '485bbe7f-d0f7-4ffe-8adb-0f1093dd2dbf',
                title: 'Come Together',
                length: 259666,
                disambiguation: 'original studio mix',
                video: false,
                'first-release-date': '1969-09-26',
              },
              length: 261000,
              number: 'A1',
              position: 1,
              id: 'af19bbfd-fb14-3d15-a6aa-8072cf06775a',
              title: 'Come Together',
            },
            {
              title: 'Something',
              id: '1745aa16-a379-3623-93f1-43702101ce29',
              position: 2,
              number: 'A2',
              length: 183000,
              recording: {
                title: 'Something',
                id: 'b849acd4-0638-49ea-8e40-7391613d4890',
                length: 183000,
                disambiguation: 'original studio mix',
                'first-release-date': '1969-09-26',
                video: false,
              },
            },
          ],
        },
      ],
    } as any);
    jest.spyOn(recordModel, 'create').mockResolvedValue(savedRecord as any);

    const result = await controller.create(createRecordDto);
    expect(result).toEqual(savedRecord);
    expect(recordModel.create).toHaveBeenCalledWith({
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 100,
      qty: 10,
      category: RecordCategory.ALTERNATIVE,
      format: RecordFormat.VINYL,
      mbid: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
      trackList: [
        {
          title: 'Come Together',
          id: 'af19bbfd-fb14-3d15-a6aa-8072cf06775a',
          recordingMbid: '485bbe7f-d0f7-4ffe-8adb-0f1093dd2dbf',
        },
        {
          title: 'Something',
          id: '1745aa16-a379-3623-93f1-43702101ce29',
          recordingMbid: 'b849acd4-0638-49ea-8e40-7391613d4890',
        },
      ],
    });
  });

  it('should update a record', async () => {
    const savedRecord = {
      _id: '2',
      artist: 'Test Record',
      price: 100,
      qty: 10,
    };

    jest.spyOn(recordModel, 'findById').mockResolvedValue({
      ...savedRecord, // this is a copy so the instance is not mutated
    } as any);

    const changes = {
      artist: 'Test Update Record',
    };
    jest.spyOn(recordModel, 'updateOne').mockResolvedValue({
      ...savedRecord,
      ...changes,
    } as any);

    const result = await controller.update(
      savedRecord._id as string,
      changes as any,
    );

    expect(result).toEqual({
      ...savedRecord,
      ...changes,
    });
    expect(recordModel.updateOne).toHaveBeenCalledWith({
      ...savedRecord,
      ...changes,
    });
  });

  it('should return an array of records', async () => {
    const records = [
      { _id: '1', name: 'Record 1', price: 100, qty: 10 },
      { _id: '2', name: 'Record 2', price: 200, qty: 20 },
    ];

    jest.spyOn(recordModel, 'find').mockReturnValue({
      find: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(records),
    } as any);

    const result = await controller.findAll();
    expect(result).toEqual(records);
    expect(recordModel.find).toHaveBeenCalled();
  });

  it('should execute a query of records', async () => {
    const records = [
      { _id: '1', name: 'Record 1', price: 100, qty: 10 },
      { _id: '2', name: 'Record 2', price: 200, qty: 20 },
    ];

    jest.spyOn(recordModel, 'find').mockReturnValue({
      find: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(records),
    } as any);

    const result = await controller.findAll('Artist');
    expect(result).toEqual(records);
    expect(recordModel.find).toHaveBeenCalled();
  });
});
