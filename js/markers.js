/**
 * Marker management for the TSP NYC Game
 */
class MarkerManager {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.markerLayer = L.layerGroup().addTo(map);
    this.nextId = 1;
  }
  
  /**
   * Add a marker to the map
   * @param {Array} latlng - [latitude, longitude] coordinates
   * @returns {Object} The created marker
   */
  addMarker(latlng) {
    // Don't add if we've reached the maximum
    if (this.markers.length >= CONFIG.MAX_PINS) {
      uiManager.showModal(
        'Maximum Pins Reached',
        `You can only place up to ${CONFIG.MAX_PINS} pins on the map.`
      );
      return null;
    }
    
    // Create custom marker icon
    const markerId = this.nextId++;
    const customIcon = this._createCustomIcon(markerId);
    
    // Create the marker and add to map
    const marker = L.marker(latlng, {
      icon: customIcon,
      draggable: true,
      autoPan: true
    }).addTo(this.markerLayer);
    
    // Store the ID with the marker
    marker.id = markerId;
    
    // Add popup with info and delete button
    const popupContent = this._createPopupContent(marker);
    marker.bindPopup(popupContent);
    
    // Set up event listeners
    this._setMarkerEventListeners(marker);
    
    // Add to our array
    this.markers.push(marker);
    
    // Update UI
    uiManager.updatePinCount(this.markers.length);
    uiManager.updateButtonStates();
    
    return marker;
  }
  
  /**
   * Create a custom icon for a marker
   * @param {Number} id - The marker ID
   * @returns {Object} L.divIcon instance
   */
  _createCustomIcon(id) {
    return L.divIcon({
      html: `<div class="custom-marker">${id}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }
  
  /**
   * Create popup content for a marker
   * @param {Object} marker - The marker to create content for
   * @returns {String} HTML content for the popup
   */
  _createPopupContent(marker) {
    const container = document.createElement('div');
    
    const idText = document.createElement('p');
    idText.textContent = `Pin #${marker.id}`;
    idText.style.marginBottom = '8px';
    container.appendChild(idText);
    
    const coordsText = document.createElement('p');
    const latlng = marker.getLatLng();
    coordsText.textContent = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
    coordsText.style.fontSize = '0.8rem';
    coordsText.style.marginBottom = '8px';
    container.appendChild(coordsText);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Remove Pin';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.style.fontSize = '0.8rem';
    deleteBtn.style.padding = '4px 8px';
    deleteBtn.onclick = () => {
      marker.closePopup();
      this.removeMarker(marker);
    };
    container.appendChild(deleteBtn);
    
    return container;
  }
  
  /**
   * Set up event listeners for a marker
   * @param {Object} marker - The marker to set up
   */
  _setMarkerEventListeners(marker) {
    // Update popup on drag
    marker.on('dragend', () => {
      marker.setPopupContent(this._createPopupContent(marker));
      // Trigger UI updates
      uiManager.clearDistance();
      mapManager.clearRoute();
    });
    
    // Add click event
    marker.on('click', (e) => {
      if (!marker.isPopupOpen()) {
        marker.openPopup();
      }
    });
  }
  
  /**
   * Remove a marker from the map
   * @param {Object} marker - The marker to remove
   */
  removeMarker(marker) {
    // Find the index of the marker
    const index = this.markers.findIndex(m => m.id === marker.id);
    if (index !== -1) {
      // Remove from array
      this.markers.splice(index, 1);
      // Remove from map
      this.markerLayer.removeLayer(marker);
      // Update UI
      uiManager.updatePinCount(this.markers.length);
      uiManager.updateButtonStates();
      uiManager.clearDistance();
      mapManager.clearRoute();
    }
  }
  
  /**
   * Remove all markers from the map
   */
  clearMarkers() {
    this.markerLayer.clearLayers();
    this.markers = [];
    this.nextId = 1;
    
    // Update UI
    uiManager.updatePinCount(0);
    uiManager.updateButtonStates();
    uiManager.clearDistance();
  }
  
  /**
   * Get all current markers
   * @returns {Array} Array of markers
   */
  getMarkers() {
    return this.markers;
  }
  
  /**
   * Export markers to JSON format
   * @returns {String} JSON string of markers data
   */
  exportMarkers() {
    const markersData = this.markers.map(marker => {
      const latlng = marker.getLatLng();
      return {
        id: marker.id,
        lat: latlng.lat,
        lng: latlng.lng
      };
    });
    
    return JSON.stringify(markersData, null, 2);
  }
  
  /**
   * Import markers from JSON data
   * @param {String} jsonData - JSON string of markers data
   * @returns {Boolean} Success flag
   */
  importMarkers(jsonData) {
    try {
      // Parse the JSON
      const markersData = JSON.parse(jsonData);
      
      // Validate
      if (!Array.isArray(markersData)) {
        throw new Error('Invalid markers data format');
      }
      
      // Clear existing markers
      this.clearMarkers();
      
      // Find the highest ID to set nextId correctly
      let highestId = 0;
      
      // Add each marker
      markersData.forEach(markerData => {
        if (markerData.id > highestId) {
          highestId = markerData.id;
        }
        
        const marker = this.addMarker([markerData.lat, markerData.lng]);
        if (marker) {
          // Override the auto-assigned ID with the saved one
          marker.id = markerData.id;
          
          // Update the icon to show the correct ID
          const customIcon = this._createCustomIcon(markerData.id);
          marker.setIcon(customIcon);
        }
      });
      
      // Set the next ID
      this.nextId = highestId + 1;
      
      return true;
    } catch (error) {
      console.error('Error importing markers:', error);
      return false;
    }
  }
}