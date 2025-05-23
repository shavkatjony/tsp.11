/**
 * Main application entry point
 */
// Initialize global instances
const mapManager = new MapManager();
const map = mapManager.initialize();
const markerManager = new MarkerManager(map);
const tspSolver = new TSPSolver();
const uiManager = new UIManager();

// Set up map click event to add markers
map.on('click', (e) => {
  markerManager.addMarker([e.latlng.lat, e.latlng.lng]);
});

// Display welcome message
setTimeout(() => {
  uiManager.showModal(
    'Welcome to NYC Pathfinder!',
    'Click anywhere on the map to place pins, then use the Solve Route button to find the optimal path between them.',
    `<p>This application solves the Traveling Salesman Problem (TSP) - finding the shortest possible route that visits each location exactly once and returns to the starting point.</p>
    <p>You can place up to ${CONFIG.MAX_PINS} pins on the map. Drag pins to reposition them.</p>
    <p>The algorithm uses a combination of Nearest Neighbor and 2-opt improvement to find an efficient route.</p>`
  );
}, 500);