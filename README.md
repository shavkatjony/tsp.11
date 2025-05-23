# NYC Pathfinder - TSP Game

NYC Pathfinder is an interactive web application that demonstrates the Traveling Salesman Problem (TSP) in the context of New York City. Users can place pins on a map of NYC, and the application will calculate and visualize the optimal route that visits all pins and returns to the starting point.

## Features

- Interactive map of New York City
- Add, remove, and drag pins on the map
- Calculate optimal routes using TSP algorithms
- Visualize the solution with animated route lines
- Export and import pin data for saving progress
- Responsive design for all device sizes

## File Structure

```
nyc-pathfinder/
├── index.html         # Main HTML file
├── css/
│   └── styles.css     # Styling for the application
├── js/
│   ├── app.js         # Main application entry point
│   ├── config.js      # Configuration settings
│   ├── map.js         # Map initialization and management
│   ├── markers.js     # Pin/marker management
│   ├── tsp.js         # TSP algorithm implementation
│   └── ui.js          # User interface management
└── README.md          # Project documentation
```

## Technologies Used

- HTML5, CSS3, and JavaScript
- Leaflet.js for interactive maps
- Custom TSP algorithm implementation

## How to Use

1. Open `index.html` in a web browser
2. Click anywhere on the map to place pins
3. Drag pins to reposition them if needed
4. Click the "Solve Route" button to find the optimal path
5. Use "Reset Pins" to clear all pins
6. Export your pins to save your progress
7. Import previously saved pins

## TSP Algorithm

The application uses a two-phase approach to solve the TSP:
1. **Nearest Neighbor algorithm** to create an initial solution
2. **2-opt improvement** to enhance the solution

This approach provides a good balance between computational efficiency and solution quality.

## Deployment

To deploy this project on GitHub Pages:

1. Create a GitHub repository
2. Upload all files to the repository
3. Go to repository Settings > Pages
4. Select the main branch as the source
5. Your site will be published at https://[username].github.io/[repository-name]/

## License

This project is open-source and available for personal and educational use.