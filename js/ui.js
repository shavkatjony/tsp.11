/**
 * UI Manager for handling user interface elements
 */
class UIManager {
  constructor() {
    this.solveBtn = document.getElementById('solve-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.fileInput = document.getElementById('file-input');
    this.pinsInfo = document.getElementById('pins-info');
    this.distanceInfo = document.getElementById('distance-info');
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalMessage = document.getElementById('modal-message');
    this.modalDetails = document.getElementById('modal-details');
    this.closeBtn = document.querySelector('.close-btn');
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners for UI elements
   */
  initEventListeners() {
    // Solve button
    this.solveBtn.addEventListener('click', () => {
      this.solveTSP();
    });
    
    // Reset button
    this.resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to remove all pins?')) {
        markerManager.clearMarkers();
      }
    });
    
    // Export button
    this.exportBtn.addEventListener('click', () => {
      this.exportPins();
    });
    
    // Import button
    this.importBtn.addEventListener('click', () => {
      this.fileInput.click();
    });
    
    // File input change
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.importPins(e.target.files[0]);
      }
    });
    
    // Modal close button
    this.closeBtn.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.hideModal();
      }
    });
  }
  
  /**
   * Update the pin count display
   * @param {Number} count - Number of pins
   */
  updatePinCount(count) {
    this.pinsInfo.textContent = `Pins: ${count}`;
  }
  
  /**
   * Update the distance display
   * @param {Number} distance - Total distance in miles
   */
  updateDistance(distance) {
    this.distanceInfo.textContent = `Total Distance: ${tspSolver.formatDistance(distance)}`;
  }
  
  /**
   * Clear the distance display
   */
  clearDistance() {
    this.distanceInfo.textContent = 'Total Distance: 0 miles';
  }
  
  /**
   * Update the state of buttons based on pin count
   */
  updateButtonStates() {
    const pinCount = markerManager.getMarkers().length;
    
    // Need at least 2 pins to solve TSP
    this.solveBtn.disabled = pinCount < 2;
    
    // Need at least 1 pin to reset/export
    this.resetBtn.disabled = pinCount === 0;
    this.exportBtn.disabled = pinCount === 0;
  }
  
  /**
   * Solve the TSP problem
   */
  solveTSP() {
    const markers = markerManager.getMarkers();
    
    if (markers.length < 2) {
      this.showModal('Not Enough Pins', 'You need at least 2 pins to solve the Traveling Salesman Problem.');
      return;
    }
    
    // Show loading state
    this.solveBtn.disabled = true;
    this.solveBtn.innerHTML = '<span>Solving...</span>';
    
    // Use setTimeout to allow UI to update before calculation
    setTimeout(() => {
      // Solve TSP
      const solution = tspSolver.solve(markers);
      
      // Draw the route
      mapManager.drawRoute(solution.route, true);
      
      // Update distance display
      this.updateDistance(solution.distance);
      
      // Generate and show report
      const report = tspSolver.generateReport(solution);
      this.showModal('Route Solved!', `Found an optimal route with a total distance of ${tspSolver.formatDistance(solution.distance)}.`, report);
      
      // Reset button state
      this.solveBtn.disabled = false;
      this.solveBtn.innerHTML = '<span>Solve Route</span>';
    }, 100);
  }
  
  /**
   * Export pins to a JSON file
   */
  exportPins() {
    const markers = markerManager.getMarkers();
    
    if (markers.length === 0) {
      this.showModal('No Pins to Export', 'There are no pins on the map to export.');
      return;
    }
    
    const jsonData = markerManager.exportMarkers();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nyc-tsp-pins.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Import pins from a JSON file
   * @param {File} file - The file to import
   */
  importPins(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const jsonData = e.target.result;
      const success = markerManager.importMarkers(jsonData);
      
      if (success) {
        this.showModal('Import Successful', `Successfully imported ${markerManager.getMarkers().length} pins to the map.`);
      } else {
        this.showModal('Import Failed', 'The file format is invalid or the data is corrupted.');
      }
      
      // Clear the file input
      this.fileInput.value = '';
    };
    
    reader.onerror = () => {
      this.showModal('Import Failed', 'An error occurred while reading the file.');
      this.fileInput.value = '';
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Show the modal with a message
   * @param {String} title - Modal title
   * @param {String} message - Modal message
   * @param {String} details - Optional HTML details to show
   */
  showModal(title, message, details = '') {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;
    this.modalDetails.innerHTML = details;
    this.modal.classList.add('show');
  }
  
  /**
   * Hide the modal
   */
  hideModal() {
    this.modal.classList.remove('show');
  }
}