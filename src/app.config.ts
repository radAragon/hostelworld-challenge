import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  mbrainzUrl: process.env.MBRAINZ_URL || 'http://musicbrainz.org/ws/2/',
};
