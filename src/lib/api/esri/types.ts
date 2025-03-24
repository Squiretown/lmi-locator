
// Type definitions for ESRI API responses
export interface EsriGeocodeResponse {
  candidates: {
    address: string;
    location: {
      x: number;  // longitude
      y: number;  // latitude
    };
    score: number;
    attributes: Record<string, any>;
  }[];
  spatialReference?: {
    wkid: number;
    latestWkid: number;
  };
}

export interface EsriReverseGeocodeResponse {
  address: {
    Match_addr: string;
    LongLabel: string;
    ShortLabel: string;
    Addr_type: string;
    Type: string;
    PlaceName: string;
    AddNum: string;
    Address: string;
    Block: string;
    Sector: string;
    Neighborhood: string;
    District: string;
    City: string;
    MetroArea: string;
    Subregion: string;
    Region: string;
    RegionAbbr: string;
    Territory: string;
    Postal: string;
    PostalExt: string;
    CountryCode: string;
  };
  location: {
    x: number;  // longitude
    y: number;  // latitude
  };
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  formattedAddress?: string;
  score?: number;
  request_info?: {
    url: string;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    approach?: string;
  };
}
