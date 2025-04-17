import { Injectable } from '@nestjs/common';
import { AppConfig } from '../app.config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MbrainzService {
  readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: AppConfig.mbrainzUrl,
      headers: {
        'User-Agent': 'TechChallenge/1.0 (rad.aragon@gmail.com)', // this complies with the MusicBrainz API rules; this should change depending on environment; also, we must comply with the rule of 1 request per second per User Agent
        Accept: 'application/json', // this forces the response to be JSON
      },
    });
  }

  /**
   * Lookup a Release by its MusicBrainz ID
   * @param mbid - The MusicBrainz ID of the release
   * @returns The release data or null if the request failed
   * @example
   *  const release = await mbrainzService.lookupRelease('d6010be3-98f8-422c-a6c9-787e2e491e58');
   *  console.log(release);
   */
  async lookupRelease(mbid: string): Promise<MBrainzReleaseAndTracks | null> {
    const response = await this.axiosInstance.get<MBrainzReleaseAndTracks>(
      `/release/${mbid}?inc=recordings`,
    );
    if (response.status !== 200) {
      console.error('Failed to lookup release', response.status, response.data);
      return null;
    }

    return response.data;
  }
}

type MBrainzReleaseAndTracks = {
  country: string;
  title: string;
  'release-events': Array<{
    date: string;
    area: {
      'iso-3166-1-codes': string[];
      'sort-name': string;
      disambiguation: string;
      name: string;
      type: string | null;
      'type-id': string | null;
      id: string;
    };
  }>;
  'status-id': string;
  'text-representation': {
    language: string;
    script: string;
  };
  packaging: string;
  disambiguation: string;
  id: string;
  'packaging-id': string;
  'cover-art-archive': {
    back: boolean;
    artwork: boolean;
    darkened: boolean;
    count: number;
    front: boolean;
  };
  date: string;
  quality: string;
  barcode: string;
  status: string;
  asin: string | null;
  media: Array<{
    'track-offset': number;
    'format-id': string;
    format: string;
    tracks: Array<MBrainzTrack>;
    position: number;
    'track-count': number;
    title: string;
  }>;
};

export type MBrainzTrack = {
  id: string;
  position: number;
  length: number;
  number: string;
  recording: {
    title: string;
    video: boolean;
    id: string;
    length: number;
    disambiguation: string;
    'first-release-date': string;
  };
  title: string;
};
