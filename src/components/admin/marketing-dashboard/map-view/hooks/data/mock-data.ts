
import { StateOption, CountyOption } from '../types/census-tract';

// Mock state and county data for demo purposes
export const STATES: StateOption[] = [
  { code: 'FL', name: 'Florida' },
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'NY', name: 'New York' },
  { code: 'IL', name: 'Illinois' },
];

export const COUNTIES_BY_STATE: Record<string, Array<CountyOption>> = {
  'FL': [
    { fips: '12086', name: 'Miami-Dade County' },
    { fips: '12011', name: 'Broward County' },
    { fips: '12099', name: 'Palm Beach County' },
    { fips: '12057', name: 'Hillsborough County' },
    { fips: '12095', name: 'Orange County' },
  ],
  'CA': [
    { fips: '06037', name: 'Los Angeles County' },
    { fips: '06073', name: 'San Diego County' },
    { fips: '06059', name: 'Orange County' },
    { fips: '06085', name: 'Santa Clara County' },
  ],
  'TX': [
    { fips: '48201', name: 'Harris County' },
    { fips: '48113', name: 'Dallas County' },
    { fips: '48029', name: 'Bexar County' },
    { fips: '48439', name: 'Tarrant County' },
  ],
  'NY': [
    { fips: '36061', name: 'New York County' },
    { fips: '36047', name: 'Kings County' },
    { fips: '36059', name: 'Nassau County' },
    { fips: '36103', name: 'Suffolk County' },
  ],
  'IL': [
    { fips: '17031', name: 'Cook County' },
    { fips: '17043', name: 'DuPage County' },
    { fips: '17089', name: 'Kane County' },
    { fips: '17097', name: 'Lake County' },
  ]
};

// Sample geometries for mock data
export const sampleGeometries = [
  {
    type: 'Polygon',
    coordinates: [[
      [-80.2, 25.8], [-80.1, 25.8], [-80.1, 25.9], [-80.2, 25.9], [-80.2, 25.8]
    ]]
  },
  {
    type: 'Polygon',
    coordinates: [[
      [-118.4, 34.0], [-118.3, 34.0], [-118.3, 34.1], [-118.4, 34.1], [-118.4, 34.0]
    ]]
  },
  {
    type: 'Polygon',
    coordinates: [[
      [-95.5, 29.7], [-95.4, 29.7], [-95.4, 29.8], [-95.5, 29.8], [-95.5, 29.7]
    ]]
  },
  {
    type: 'Polygon',
    coordinates: [[
      [-74.0, 40.7], [-73.9, 40.7], [-73.9, 40.8], [-74.0, 40.8], [-74.0, 40.7]
    ]]
  },
  {
    type: 'Polygon',
    coordinates: [[
      [-87.7, 41.8], [-87.6, 41.8], [-87.6, 41.9], [-87.7, 41.9], [-87.7, 41.8]
    ]]
  }
];
