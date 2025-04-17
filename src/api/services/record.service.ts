import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { MbrainzService, MBrainzTrack } from '../../mbrainz/mbrainz.service';

@Injectable()
export class RecordService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly mbrainzService: MbrainzService,
  ) {}

  async create(request: CreateRecordRequestDTO): Promise<Record> {
    const { mbid: originalMbid } = request;

    const releaseData = originalMbid
      ? await this.retrieveReleaseData(originalMbid)
      : undefined;

    const record = await this.recordModel.create({
      artist: request.artist,
      album: request.album,
      price: request.price,
      qty: request.qty,
      format: request.format,
      category: request.category,
      mbid: releaseData?.mbid,
      trackList: releaseData?.tracks.map((track) => ({
        title: track.title,
        id: track.id,
        recordingMbid: track.recording.id,
      })),
    });

    return record;
  }

  async update(
    id: string,
    updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<Record> {
    const record = await this.recordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    const { mbid: newMbid } = updateRecordDto;

    const { mbid, trackList } = await (async () => {
      if (!newMbid || newMbid === record.mbid) {
        return { mbid: record.mbid, trackList: record.trackList };
      }

      const releaseData = await this.retrieveReleaseData(newMbid);
      return {
        mbid: releaseData?.mbid,
        trackList: releaseData?.tracks.map((track) => ({
          title: track.title,
          id: track.id,
          recordingMbid: track.recording.id,
        })),
      };
    })();

    Object.assign(record, {
      ...updateRecordDto,
      mbid,
      trackList,
    });

    const updated = await this.recordModel.updateOne(record);
    if (!updated) {
      throw new InternalServerErrorException('Failed to update record');
    }

    return record;
  }

  private async retrieveReleaseData(
    mbid: string,
  ): Promise<{ mbid: string; tracks: MBrainzTrack[] } | undefined> {
    console.log('Looking up Release in MusicBrainz');
    const mbRelease = await this.mbrainzService.lookupRelease(mbid);

    if (mbRelease) {
      return {
        mbid: mbRelease.id,
        tracks: mbRelease.media[0].tracks,
      };
    }

    return undefined;
  }

  async search({
    q,
    artist,
    album,
    format,
    category,
    page,
    limit,
  }: {
    q?: string;
    artist?: string;
    album?: string;
    format?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<Record[]> {
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
