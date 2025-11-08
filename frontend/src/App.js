import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLocation.name,
          latitude: parseFloat(newLocation.latitude),
          longitude: parseFloat(newLocation.longitude),
          description: newLocation.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add location');
      }

      setNewLocation({ name: '', latitude: '', longitude: '', description: '' });
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete location');
      }

      fetchLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading locations...</div>;
  }

  // Calculate center position from locations or use default (Seoul)
  const center = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude]
    : [37.5665, 126.9780];

  return (
    <div className="App">
      <header className="header">
        <h1>Map1 - Location Display</h1>
        <button 
          className="add-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Location'}
        </button>
      </header>

      {error && <div className="error">Error: {error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newLocation.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="latitude">Latitude:</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={newLocation.latitude}
                onChange={handleInputChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitude:</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={newLocation.longitude}
                onChange={handleInputChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newLocation.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <button type="submit" className="submit-button">Add Location</button>
          </form>
        </div>
      )}

      <div className="map-container">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location) => (
            <Marker 
              key={location.id} 
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  <p className="coordinates">
                    Lat: {location.latitude}, Lng: {location.longitude}
                  </p>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(location.id)}
                  >
                    Delete
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="location-list">
        <h2>Locations ({locations.length})</h2>
        <ul>
          {locations.map((location) => (
            <li key={location.id}>
              <strong>{location.name}</strong> - {location.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
