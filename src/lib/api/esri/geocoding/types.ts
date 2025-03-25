
import { EsriGeocodeResponse } from '../types';

export interface GeocodeApproachResult {
  response: Response;
  data: EsriGeocodeResponse;
  requestUrl: string;
}
