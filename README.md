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
2. Open `login.html` in your web browser
3. Enter the access password and you will be redirected to `index.html`
4. Start managing your lab inventory!

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
 - **SessionStorage Auth Gate**: Simple password gate (client-side only)

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
The application loads an extensive inventory (chemicals + apparatus) plus shelf + oxidizer collections automatically after authentication.

## Authentication

### Overview
Access to the main application is gated by a lightweight password-only login (`login.html`). Successful authentication sets a session flag `labAuth` in `sessionStorage` which permits viewing `index.html`.

### Default Password
- The default password is `admin123` (defined in `auth.js`). CHANGE THIS before deploying.

### How It Works
1. User opens `login.html` and submits password.
2. On success, `sessionStorage.labAuth = '1'` is written and the user is redirected to `index.html`.
3. `index.html` performs a pre-render gate: if flag missing, immediate redirect back to `login.html` (no content flash).

### Security Notes
- This is purely client-side; compiled code + password are visible to end users.
- It protects casual access but NOT determined attackers.
- For stronger security, implement server-side auth (e.g. Vercel Middleware + external identity provider) or host behind VPN.
- Consider rotating password regularly and avoiding reuse with admin credentials.

### Changing the Password
Edit the `PASSWORD` constant near the top of `auth.js` and redeploy.

### Lockout Mechanism
- After 5 failed attempts a lockout of 5 minutes is triggered (stored in `localStorage`).
- Lockout automatically clears after expiry or manual localStorage reset.

### Removing Authentication (Optional)
1. Delete `login.html` and `auth.js`.
2. Remove the auth gate `<script>` block from `index.html`.
3. Redeploy.

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