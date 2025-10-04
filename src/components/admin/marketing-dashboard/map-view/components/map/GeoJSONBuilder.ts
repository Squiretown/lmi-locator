
import { CensusTract } from '../../hooks/types/census-tract';

export const createTractGeoJSON = (tracts: CensusTract[], selectedTracts: CensusTract[]) => {
  // Filter out tracts without geometry data
  const tractsWithGeometry = tracts.filter(tract => tract.geometry && tract.geometry.coordinates);
  
  console.log(`GeoJSON: ${tractsWithGeometry.length} of ${tracts.length} tracts have geometry`);
  
  // Create GeoJSON feature collection from tracts
  return {
    type: 'FeatureCollection' as const,
    features: tractsWithGeometry.map(tract => ({
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
