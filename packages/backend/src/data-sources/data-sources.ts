import { GoogleAPI } from './google';

export interface DataSources {
  google: GoogleAPI;
}

export function getDataSources() {
  return {
    google: new GoogleAPI(),
  };
}
