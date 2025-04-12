
// Map style constants and utility functions
import mapboxgl from 'mapbox-gl';

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
export const DEFAULT_CENTER: [number, number] = [-95.7129, 37.0902]; // Center of US
export const DEFAULT_ZOOM = 3;

export const tractFillColors = {
  selected: '#3b82f6', // blue for selected
  eligible: '#22c55e', // green for LMI eligible
  nonEligible: '#ef4444' // red for non-eligible
};

export const tractLineColors = {
  selected: '#2563eb', // blue for selected
  eligible: '#16a34a', // green for LMI eligible
  nonEligible: '#dc2626' // red for non-eligible
};

// Expression for fill color based on tract properties
export const getTractFillColor = (): mapboxgl.Expression => {
  return [
    'case',
    ['==', ['get', 'selected'], true], tractFillColors.selected,
    ['==', ['get', 'isLmiEligible'], true], tractFillColors.eligible,
    tractFillColors.nonEligible
  ] as unknown as mapboxgl.Expression;
};

// Expression for line color based on tract properties
export const getTractLineColor = (): mapboxgl.Expression => {
  return [
    'case',
    ['==', ['get', 'selected'], true], tractLineColors.selected,
    ['==', ['get', 'isLmiEligible'], true], tractLineColors.eligible,
    tractLineColors.nonEligible
  ] as unknown as mapboxgl.Expression;
};

// Expression for line width based on selection state
export const getTractLineWidth = (): mapboxgl.Expression => {
  return [
    'case',
    ['==', ['get', 'selected'], true], 2,
    1
  ] as unknown as mapboxgl.Expression;
};
