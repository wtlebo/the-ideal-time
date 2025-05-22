const R = 3958.8; // Earth radius in miles

function haversine(lat1, lon1, lat2, lon2) {
  const dlat = Math.radians(lat2 - lat1);
  const dlon = Math.radians(lon2 - lon1);
  const a = Math.sin(dlat/2)**2 + Math.cos(Math.radians(lat1)) * Math.cos(Math.radians(lat2)) * Math.sin(dlon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extend Math object with radians method
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

module.exports = {
  haversine
};
