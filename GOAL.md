# GOAL - MapTrips Application Objective

## Primary Mission

MapTrips is a **safety-focused travel mapping platform** designed to inform travelers, particularly foreigners and digital nomads, about risk zones and safe areas across Latin American cities.

## Platform Objective

Become the **most reliable, fastest, and incredibly user-friendly platform** for travelers seeking safety information in Latin America.

## Core Functionality

### Safety Zone Mapping
- **Risk Zones**: Mark dangerous areas where travelers should NOT rent accommodations, visit, or travel through
- **Safe Zones**: Highlight secure areas and tourist-friendly neighborhoods to encourage visits
- **Color-Coded System**: Visual indicators (Safe, Medium, Regular, Caution, Unsafe) for quick risk assessment

### Geographic Coverage
- Covers multiple countries across Latin America (19 countries total)
- City-level granular mapping with polygon-based zone definitions
- Continuous expansion as team members validate new areas on the ground

### Property Visualization
- **Airbnb Integration**: Display available Airbnb properties on the map with pricing and location
- **Instagrammable Spots**: Mark photogenic locations and tourist attractions
- **Co-working Spaces**: Identify digital nomad-friendly workspaces

### Data Collection Method
- **Manual On-Site Validation**: Team members physically visit locations within each country
- **Ground Truth Verification**: All zones are manually validated and regularly updated
- **Local Knowledge**: Risk assessments based on real-world observation, not automated data

## User Experience Goals

1. **Quick Visual Assessment**: Users should immediately understand safety levels through color-coded map zones
2. **Informed Decisions**: Enable travelers to make educated choices about where to stay, work, and visit
3. **Comprehensive View**: Combine safety data, accommodations, and points of interest in one interface
4. **Regular Updates**: Continuous addition of new controlled zones as team expands coverage

## Technical Implementation Context

- Interactive Google Maps interface with custom polygon overlays
- Country → City → Zone hierarchy for organization
- Notes system for additional context on zones and properties
- Supabase backend for data persistence
- Next.js 15 + React 19 frontend with Tailwind CSS

## When Making Incremental Improvements

Any changes or enhancements should align with our three pillars:

### 1. Reliability
- **Prioritize user safety**: Ensure risk information is clear and prominent
- **Maintain data integrity**: Respect the manual validation process
- **Preserve accuracy**: All safety data must remain trustworthy and ground-validated

### 2. Speed & Performance
- **Optimize load times**: Ensure maps and data load quickly
- **Minimize delays**: Reduce any friction in user interactions
- **Efficient rendering**: Keep the application responsive even with large datasets

### 3. Incredible Usability
- **Enhance user experience**: Make it easier for travelers to find and understand safety information
- **Intuitive interface**: Every feature should be self-explanatory and easy to use
- **Support scalability**: Allow easy addition of new countries, cities, and zones
- **Preserve visualization**: Keep the color-coding system consistent and intuitive
- **Improve decision-making**: Help users quickly identify where it's safe to stay, visit, and explore

The ultimate goal is to **protect travelers** by providing accurate, ground-validated safety information through the most reliable, fastest, and user-friendly platform in Latin America.
