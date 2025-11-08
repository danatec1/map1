# Map1 - Location Display Application

A full-stack web application for displaying and managing locations on an interactive map.

## Technology Stack

- **Backend**: Java (Spring Boot)
- **Frontend**: React, HTML, CSS, JavaScript
- **Map Library**: Leaflet & React-Leaflet
- **API**: RESTful API

## Features

- Display locations on an interactive map
- Add new locations with name, coordinates, and description
- View location details in popups
- Delete locations
- Responsive design

## Project Structure

```
map1/
├── backend/           # Java Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/map1/app/
│   │       │       ├── Map1Application.java
│   │       │       ├── controller/
│   │       │       ├── model/
│   │       │       └── service/
│   │       └── resources/
│   └── pom.xml
└── frontend/         # React frontend
    ├── public/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   
   Or build the JAR and run it:
   ```bash
   mvn clean package
   java -jar target/map1-backend-1.0.0.jar
   ```

The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will open in your browser at `http://localhost:3000`

## API Endpoints

- `GET /api/locations` - Get all locations
- `GET /api/locations/{id}` - Get a specific location
- `POST /api/locations` - Add a new location
- `DELETE /api/locations/{id}` - Delete a location

## Usage

1. Start the backend server (port 8080)
2. Start the frontend application (port 3000)
3. Open your browser to `http://localhost:3000`
4. Click "Add Location" to add new locations
5. Click on markers to view location details
6. Use the delete button in popups to remove locations

## Default Locations

The application comes with three sample locations in Seoul:
- Seoul Tower
- Gangnam Station
- Gyeongbokgung Palace
