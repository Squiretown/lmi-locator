
import { CensusTract } from '../../hooks/types/census-tract';

export const createTractGeoJSON = (tracts: CensusTract[], selectedTracts: CensusTract[]) => {
  // Create GeoJSON feature collection from tracts
  return {
    type: 'FeatureCollection' as const,
    features: tracts.map(tract => ({
      type: 'Feature' as const,
      geometry: tract.geometry,
      properties: {
        tractId: tract.tractId,
        isLmiEligible: tract.isLmiEligible,
        amiPercentage: tract.amiPercentage,
        incomeCategory: tract.incomeCategory,
        propertyCount: tract.propertyCount,
        selected: selectedTracts.some(t => t.tractId === tract.tractId)
      }
    }))
  };
};
