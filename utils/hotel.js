function getMarkerColor(safetyScore) {
  if (safetyScore >= 4.5) return '#4ade80';
  if (safetyScore >= 4.0) return '#fbbf24';
  return '#fb7185';
}

function getMapScale(zoomLevel) {
  const numeric = Number(zoomLevel || 13);
  return Math.max(5, Math.min(18, numeric));
}

function buildMarkerLabel(hotel) {
  return {
    content: `${hotel.safetyScore || 0}`,
    color: '#ffffff',
    fontSize: 11,
    borderRadius: 14,
    bgColor: getMarkerColor(hotel.safetyScore || 0),
    padding: 5,
    textAlign: 'center',
  };
}

function buildMarkers(hotels) {
  return (hotels || []).map((hotel, index) => ({
    id: index + 1,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    width: 28,
    height: 28,
    iconPath: '/icon.png',
    joinCluster: false,
    callout: {
      content: hotel.name,
      color: '#0f172a',
      fontSize: 12,
      bgColor: '#ffffff',
      borderRadius: 10,
      padding: 8,
      display: 'BYCLICK',
      textAlign: 'center',
    },
    label: buildMarkerLabel(hotel),
  }));
}

function buildCircles(points, visible) {
  if (!visible) return [];

  return (points || []).map((point) => {
    const intensity = Number(point.weight || 0.5);
    let fillColor = 'rgba(74, 222, 128, 0.24)';
    if (intensity < 0.6) fillColor = 'rgba(251, 191, 36, 0.24)';
    if (intensity < 0.4) fillColor = 'rgba(251, 113, 133, 0.24)';

    return {
      latitude: point.latitude,
      longitude: point.longitude,
      color: fillColor,
      fillColor,
      radius: 160 + intensity * 280,
      strokeWidth: 0,
    };
  });
}

module.exports = {
  getMarkerColor,
  getMapScale,
  buildMarkers,
  buildCircles,
};
