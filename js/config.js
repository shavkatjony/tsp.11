/**
 * Configuration settings for the TSP NYC Game
 */
const CONFIG = {
  // New York City center coordinates
  NYC_CENTER: [40.7128, -74.0060],
  
  // Initial zoom level
  INITIAL_ZOOM: 12,
  
  // Maximum number of pins allowed
  MAX_PINS: 15,
  
  // Map configuration
  MAP: {
    // Attribution text
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    
    // Tile server URL
    TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    
    // Map options
    OPTIONS: {
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [40.4774, -74.2591], // Southwest coordinates
        [40.9176, -73.7004]  // Northeast coordinates
      ]
    }
  },
  
  // TSP algorithm configuration
  TSP: {
    // Number of iterations for the 2-opt improvement
    TWO_OPT_ITERATIONS: 100,
    
    // Show animation of the TSP solution process
    SHOW_ANIMATION: true,
    
    // Delay between steps in animation (ms)
    ANIMATION_DELAY: 100
  }
};