import { Test, TestingModule } from '@nestjs/testing';
import { MbrainzService } from './mbrainz.service';

describe('MbrainzService', () => {
  let service: MbrainzService;
  let getSpy: jest.SpyInstance;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MbrainzService],
    }).compile();

    service = module.get<MbrainzService>(MbrainzService);
    getSpy = jest.spyOn(service.axiosInstance, 'get');
  });

  it('should lookup a release', async () => {
    getSpy.mockResolvedValue({
      status: 200,
      data: {
        id: 'd6010be3-98f8-422c-a6c9-787e2e491e58',
        title: 'Abbey Road',
      },
    });

    const release = await service.lookupRelease(
      'd6010be3-98f8-422c-a6c9-787e2e491e58',
    );
    expect(release).toBeDefined();
    expect(getSpy).toHaveBeenCalledWith(
      '/release/d6010be3-98f8-422c-a6c9-787e2e491e58?inc=recordings',
    );
  });

  it('should return null if the release is not found', async () => {
    getSpy.mockResolvedValue({
      status: 404,
    });

    const release = await service.lookupRelease(
      'd6010be3-98f8-422c-a6c9-787e2e491e58',
    );
    expect(release).toBeNull();
  });
});
