
import { CensusTract, SearchParams, StatsData } from '../types/census-tract';
import { sampleGeometries } from '../data/mock-data';

// Generate a random geometry near the state's approximate location
export function generateRandomGeometry(stateCode: string) {
  // Approximate center points for states
  const stateCenters: Record<string, [number, number]> = {
    'FL': [-81.5, 28.1],
    'CA': [-119.4, 37.8],
    'TX': [-99.3, 31.4],
    'NY': [-75.5, 42.9],
    'IL': [-89.3, 40.0]
  };

  const center = stateCenters[stateCode] || [-95.7, 39.8]; // Default to center of US
  
  // Generate random polygon near center
  const offsetX = (Math.random() - 0.5) * 0.4;
  const offsetY = (Math.random() - 0.5) * 0.4;
  
  return {
    type: 'Polygon',
    coordinates: [[
      [center[0] + offsetX - 0.05, center[1] + offsetY - 0.05],
      [center[0] + offsetX + 0.05, center[1] + offsetY - 0.05],
      [center[0] + offsetX + 0.05, center[1] + offsetY + 0.05],
      [center[0] + offsetX - 0.05, center[1] + offsetY + 0.05],
      [center[0] + offsetX - 0.05, center[1] + offsetY - 0.05]
    ]]
  };
}

export function generateMockTracts(params: SearchParams): {
  tracts: CensusTract[],
  stats: StatsData
} {
  // Create 20 mock tracts
  const mockTracts: CensusTract[] = [];
  
  for (let i = 0; i < 20; i++) {
    const tractId = `${params.county || '12086'}${100000 + i}`;
    const isLmiEligible = Math.random() > 0.4; // 60% are LMI eligible
    const amiPercentage = isLmiEligible 
      ? Math.floor(Math.random() * 30) + 50 // 50-80% for eligible
      : Math.floor(Math.random() * 40) + 81; // 81-120% for non-eligible
    
    const medianIncome = amiPercentage * 1000;
    
    let incomeCategory;
    if (amiPercentage <= 30) incomeCategory = 'Extremely Low';
    else if (amiPercentage <= 50) incomeCategory = 'Very Low';
    else if (amiPercentage <= 80) incomeCategory = 'Low';
    else if (amiPercentage <= 120) incomeCategory = 'Moderate';
    else incomeCategory = 'Above Moderate';
    
    const propertyCount = Math.floor(Math.random() * 5000) + 1000;
    
    // Use one of our sample geometries, adding small random offset
    const baseGeometry = sampleGeometries[i % sampleGeometries.length];
    const offsetX = (Math.random() - 0.5) * 0.2;
    const offsetY = (Math.random() - 0.5) * 0.2;
    
    const geometry = {
      type: baseGeometry.type,
      coordinates: baseGeometry.coordinates.map(ring => 
        ring.map(([x, y]) => [x + offsetX, y + offsetY])
      )
    };
    
    mockTracts.push({
      tractId,
      isLmiEligible,
      amiPercentage,
      medianIncome,
      incomeCategory,
      propertyCount,
      geometry
    });
  }
  
  // Calculate statistics
  const lmiTracts = mockTracts.filter(t => t.isLmiEligible).length;
  const totalPropertyCount = mockTracts.reduce((sum, t) => sum + t.propertyCount, 0);
  
  const statsData = {
    totalTracts: mockTracts.length,
    lmiTracts,
    propertyCount: totalPropertyCount,
    lmiPercentage: Math.round((lmiTracts / mockTracts.length) * 100)
  };
  
  return {
    tracts: mockTracts,
    stats: statsData
  };
}
