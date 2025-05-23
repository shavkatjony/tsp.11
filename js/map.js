/**
 * Map initialization and management
 */
class MapManager {
  constructor() {
    this.map = null;
    this.routeLayer = null;
  }
  
  /**
   * Initialize the map
   * @returns {Object} The map instance
   */
  initialize() {
    // Create map instance centered on NYC
    this.map = L.map('map', {
      center: CONFIG.NYC_CENTER,
      zoom: CONFIG.INITIAL_ZOOM,
      ...CONFIG.MAP.OPTIONS
    });
    
    // Add tile layer (map imagery)
    L.tileLayer(CONFIG.MAP.TILE_URL, {
      attribution: CONFIG.MAP.ATTRIBUTION
    }).addTo(this.map);
    
    // Create a layer for the route
    this.routeLayer = L.layerGroup().addTo(this.map);
    
    return this.map;
  }
  
  /**
   * Clear the route from the map
   */
  clearRoute() {
    if (this.routeLayer) {
      this.routeLayer.clearLayers();
    }
  }
  
  /**
   * Draw a route on the map
   * @param {Array} route - Array of marker objects in the order of the route
   * @param {Boolean} animate - Whether to animate the drawing of the route
   */
  drawRoute(route, animate = false) {
    this.clearRoute();
    
    if (!route || route.length < 2) return;
    
    // Create line coordinates
    const polylinePoints = route.map(marker => marker.getLatLng());
    
    // Add closing segment if we have at least 3 points (first point = last point)
    if (route.length > 2) {
      polylinePoints.push(route[0].getLatLng());
    }
    
    // Create the polyline
    const routeLine = L.polyline(polylinePoints, {
      color: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      weight: 4,
      opacity: 0.8,
      className: 'route-line'
    }).addTo(this.routeLayer);
    
    // Animate the route if requested
    if (animate && CONFIG.TSP.SHOW_ANIMATION) {
      this._animateRoute(routeLine);
    }
    
    // Fit the map to show all the route
    this.map.fitBounds(routeLine.getBounds(), {
      padding: [50, 50],
      maxZoom: 14
    });
    
    return routeLine;
  }
  
  /**
   * Animate the drawing of a route
   * @param {Object} polyline - The L.Polyline instance to animate
   */
  _animateRoute(polyline) {
    const originalPoints = polyline.getLatLngs();
    polyline.setLatLngs([originalPoints[0]]);
    
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < originalPoints.length) {
        const newPoints = originalPoints.slice(0, i + 1);
        polyline.setLatLngs(newPoints);
      } else {
        clearInterval(interval);
      }
    }, CONFIG.TSP.ANIMATION_DELAY);
  }
  
  /**
   * Get the current map instance
   * @returns {Object} The map instance
   */
  getMap() {
    return this.map;
  }
  
  /**
   * Recenter the map on NYC
   */
  recenterMap() {
    this.map.setView(CONFIG.NYC_CENTER, CONFIG.INITIAL_ZOOM);
  }
}