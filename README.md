# Lab Management System

A modern, responsive web application for managing laboratory chemicals and apparatus inventory.

## Features

### 🧪 Chemical Management
- Add, edit, and delete chemical entries
- Track chemical formula, quantity, storage location
- Monitor expiry dates with visual warnings
- Hazard level classification (Low, Medium, High, Extreme)
- **Automatic chemical usage information** - Click any chemical to see detailed uses and applications
- Built-in database with information on 40+ common laboratory chemicals
- Add custom notes for specific chemicals
- Real-time search functionality

### 🔬 Apparatus Management
- Manage laboratory equipment inventory
- Track equipment type, quantity, and condition
- Monitor maintenance schedules
- Add detailed notes for each item
- Location tracking for easy retrieval

### 🔍 Search Functionality
- Real-time search across all inventory items
- Search by name, formula, location, type, or any field
- Highlighted search results for easy identification
- Search works across both chemicals and apparatus tabs
- **Alphabetical sorting** - All items are automatically displayed in alphabetical order by name

### 💾 Data Persistence
- All data saved locally in browser storage
- No server required - works offline
- Data persists between browser sessions

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start managing your lab inventory!

### Usage

#### Adding Items
1. Navigate to either the "Chemicals" or "Apparatus" tab
2. Fill out the form with item details
3. Click "Add Chemical" or "Add Apparatus" to save

#### Searching Items
1. Use the search box in the header
2. Type any keyword related to the item you're looking for
3. Results will be highlighted and filtered in real-time

#### Managing Items
- **Edit**: Click the "Edit" button on any item card to modify its details
- **Delete**: Click the "Delete" button to remove an item (with confirmation)

## File Structure

```
lab-management-system/
│
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation file
```

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure and forms
- **CSS3**: Modern styling with flexbox/grid layouts
- **Vanilla JavaScript**: ES6+ features for functionality
- **LocalStorage API**: Client-side data persistence
- **Sorting Algorithm**: Case-insensitive alphabetical sorting using `localeCompare()`

### Browser Compatibility
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Responsive Design
- Mobile-friendly interface
- Tablet and desktop optimized
- Touch-friendly controls

## Features Overview

### Sorting & Organization
- **Alphabetical Ordering**: All chemicals and apparatus are automatically sorted alphabetically by name
- **Case-Insensitive**: Sorting handles mixed case names correctly (e.g., "ethanol" and "Ethanol")
- **Special Characters**: Properly sorts items with numbers, hyphens, and special characters
- **Search Results**: Filtered search results are also displayed in alphabetical order

### Chemical Tracking
- **Name & Formula**: Chemical identification
- **Quantity & Unit**: Amount tracking (ml, g, etc.)
- **Storage Location**: Physical location in lab
- **Expiry Date**: Safety monitoring with warnings
- **Hazard Level**: Safety classification system

### Apparatus Tracking
- **Name & Type**: Equipment identification
- **Quantity Available**: Stock tracking
- **Storage Location**: Physical location tracking
- **Condition**: Equipment status monitoring
- **Last Maintenance**: Maintenance schedule tracking
- **Notes**: Additional details and specifications

### Sample Data
The application comes with sample data to demonstrate features:
- 3 sample chemicals with various hazard levels
- 3 sample apparatus items with different types

## Customization

### Adding New Fields
To add new fields to chemicals or apparatus:
1. Add form inputs in `index.html`
2. Update the JavaScript object creation in `script.js`
3. Modify the display cards in the render functions
4. Update CSS if needed for styling

### Styling Changes
- Modify `styles.css` to change colors, fonts, or layout
- CSS variables can be added for easy theme customization
- All components use modern CSS features

## Security & Privacy
- All data stored locally in browser
- No external servers or data transmission
- No user accounts or authentication required
- Data cleared when browser storage is cleared

## Future Enhancements
- Export/Import functionality (JSON, CSV)
- Barcode scanning support
- Advanced filtering options
- Multi-user support with cloud storage
- Mobile app version
- Integration with laboratory equipment APIs

## Contributing
This is a standalone project. Feel free to fork and modify for your specific lab requirements.

## License
This project is open source and available under the MIT License.

## Support
For questions or issues, please refer to the source code comments or create an issue in the project repository.