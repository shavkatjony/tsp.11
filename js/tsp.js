/**
 * TSP algorithm implementation
 */
class TSPSolver {
  /**
   * Solve the Traveling Salesman Problem
   * @param {Array} markers - Array of markers representing points
   * @returns {Object} Solution object with route and distance
   */
  solve(markers) {
    if (!markers || markers.length < 2) {
      return {
        route: [],
        distance: 0,
        steps: []
      };
    }
    
    // Clone the markers array to avoid modifying the original
    const points = [...markers];
    
    // Store steps for visualization if needed
    const steps = [];
    
    // Get initial solution using nearest neighbor
    let route = this.nearestNeighbor(points);
    steps.push({
      type: 'initial',
      route: [...route],
      description: 'Initial route using nearest neighbor algorithm'
    });
    
    // Improve the solution using 2-opt
    const improved = this.twoOpt(route);
    route = improved.route;
    
    // Add the improved steps
    steps.push(...improved.steps);
    
    // Calculate the total distance
    const distance = this.calculateTotalDistance(route);
    
    return {
      route,
      distance,
      steps
    };
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   * @param {Object} point1 - First point with getLatLng method
   * @param {Object} point2 - Second point with getLatLng method
   * @returns {Number} Distance in miles
   */
  calculateDistance(point1, point2) {
    const latlng1 = point1.getLatLng();
    const latlng2 = point2.getLatLng();
    
    const lat1 = latlng1.lat * Math.PI / 180;
    const lat2 = latlng2.lat * Math.PI / 180;
    const lon1 = latlng1.lng * Math.PI / 180;
    const lon2 = latlng2.lng * Math.PI / 180;
    
    // Haversine formula
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Radius of the Earth in miles
    const R = 3958.8;
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Calculate total distance of a route
   * @param {Array} route - Ordered array of points
   * @returns {Number} Total distance in miles
   */
  calculateTotalDistance(route) {
    let totalDistance = 0;
    
    for (let i = 0; i < route.length; i++) {
      const currentPoint = route[i];
      const nextPoint = route[(i + 1) % route.length]; // Loop back to start
      
      totalDistance += this.calculateDistance(currentPoint, nextPoint);
    }
    
    return totalDistance;
  }
  
  /**
   * Nearest neighbor algorithm for TSP
   * @param {Array} points - Array of points
   * @returns {Array} Ordered array of points representing the route
   */
  nearestNeighbor(points) {
    if (points.length <= 1) return points;
    
    const route = [points[0]]; // Start with the first point
    const unvisited = points.slice(1); // All other points
    
    while (unvisited.length > 0) {
      const lastPoint = route[route.length - 1];
      
      // Find the nearest unvisited point
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(lastPoint, unvisited[0]);
      
      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(lastPoint, unvisited[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Add the nearest point to the route
      route.push(unvisited[nearestIndex]);
      
      // Remove it from unvisited
      unvisited.splice(nearestIndex, 1);
    }
    
    return route;
  }
  
  /**
   * 2-opt algorithm for improving TSP solutions
   * @param {Array} initialRoute - Initial ordered array of points
   * @returns {Object} Improved route and steps
   */
  twoOpt(initialRoute) {
    if (initialRoute.length <= 2) return { route: initialRoute, steps: [] };
    
    let route = [...initialRoute];
    let improved = true;
    let iterations = 0;
    const steps = [];
    
    while (improved && iterations < CONFIG.TSP.TWO_OPT_ITERATIONS) {
      improved = false;
      iterations++;
      
      const initialDistance = this.calculateTotalDistance(route);
      
      // Try all possible 2-opt swaps
      for (let i = 0; i < route.length - 2; i++) {
        for (let j = i + 2; j < route.length; j++) {
          // Skip if we're looking at the first and last edge in the tour
          if (i === 0 && j === route.length - 1) continue;
          
          // Create new route with a 2-opt swap
          const newRoute = this.twoOptSwap(route, i, j);
          const newDistance = this.calculateTotalDistance(newRoute);
          
          // If the new route is better, keep it
          if (newDistance < initialDistance) {
            route = newRoute;
            improved = true;
            
            steps.push({
              type: 'improvement',
              route: [...route],
              description: `Improved route by swapping segments (${i},${i+1}) and (${j},${j+1}), reducing distance by ${(initialDistance - newDistance).toFixed(2)} miles`
            });
            
            // Break out of the inner loop
            break;
          }
        }
        
        // If we found an improvement, break out of the outer loop too
        if (improved) break;
      }
    }
    
    if (steps.length === 0) {
      steps.push({
        type: 'no-improvement',
        route: [...route],
        description: 'No further improvements found with 2-opt algorithm'
      });
    }
    
    return { route, steps };
  }
  
  /**
   * Perform a 2-opt swap on a route
   * @param {Array} route - Current route
   * @param {Number} i - First index
   * @param {Number} j - Second index
   * @returns {Array} New route after swap
   */
  twoOptSwap(route, i, j) {
    // Create a new array with the route up to i
    const newRoute = route.slice(0, i + 1);
    
    // Add the segment from j down to i+1 (reversed)
    for (let k = j; k > i; k--) {
      newRoute.push(route[k]);
    }
    
    // Add the rest of the route after j
    for (let k = j + 1; k < route.length; k++) {
      newRoute.push(route[k]);
    }
    
    return newRoute;
  }
  
  /**
   * Format a distance nicely
   * @param {Number} distance - Distance in miles
   * @returns {String} Formatted distance
   */
  formatDistance(distance) {
    if (distance < 0.1) {
      return `${(distance * 5280).toFixed(0)} feet`;
    }
    return `${distance.toFixed(2)} miles`;
  }
  
  /**
   * Generate a detailed solution report
   * @param {Object} solution - Solution object with route and distance
   * @returns {String} HTML formatted report
   */
  generateReport(solution) {
    if (!solution || !solution.route || solution.route.length < 2) {
      return '<p>Not enough points to create a route.</p>';
    }
    
    const { route, distance, steps } = solution;
    
    let report = `<h3>Total Distance: ${this.formatDistance(distance)}</h3>`;
    
    // Route details
    report += '<h4>Route Order:</h4>';
    report += '<ol>';
    route.forEach((marker, index) => {
      const latlng = marker.getLatLng();
      report += `<li>Pin #${marker.id} (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})</li>`;
    });
    // Add return to start
    const firstMarker = route[0];
    report += `<li>Return to Pin #${firstMarker.id}</li>`;
    report += '</ol>';
    
    // Add algorithm steps if available
    if (steps && steps.length > 0) {
      report += '<h4>Algorithm Steps:</h4>';
      report += '<ul>';
      steps.forEach((step, index) => {
        report += `<li>${step.description}</li>`;
      });
      report += '</ul>';
    }
    
    return report;
  }
}