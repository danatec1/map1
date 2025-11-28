import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const API_KEY = decodeURIComponent('80xUsCgepF86Z2w4g%2BHDkjQc34EdeaXB7OHRMx%2FEoJF2293eGv6QlPjt9dZRPb4g440XcX1%2B1jCvMwcLxgjZ6A%3D%3D');

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert('Permission denied', 'Location permission is required to find nearby hospitals.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchHospitals(location.coords);
    })();
  }, []);

  const fetchHospitals = async (coords) => {
    try {
      const url = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytLcinfoInqire';
      const queryParams = `?serviceKey=${encodeURIComponent(API_KEY)}&WGS84_LON=${coords.longitude}&WGS84_LAT=${coords.latitude}&pageNo=1&numOfRows=50`;

      console.log('Fetching hospitals from:', url + queryParams);

      const response = await axios.get(url + queryParams);

      const parser = new XMLParser();
      const result = parser.parse(response.data);

      if (result.response && result.response.body && result.response.body.items) {
        const items = result.response.body.items.item;
        const hospitalList = Array.isArray(items) ? items : [items];

        const markers = hospitalList.map((item, index) => {
          const lat = parseFloat(item.latitude);
          const lon = parseFloat(item.longitude);
          const dist = getDistanceFromLatLonInKm(coords.latitude, coords.longitude, lat, lon);

          return {
            id: index,
            title: item.dutyName,
            description: item.dutyTel1 || item.dutyAddr,
            coordinate: {
              latitude: lat,
              longitude: lon,
            },
            distance: dist
          };
        })
          .filter(marker => marker.coordinate.latitude && marker.coordinate.longitude)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        console.log('Displayed Hospitals:', JSON.stringify(markers, null, 2));
        setHospitals(markers);
      } else {
        console.log('No data found or invalid response structure:', result);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to fetch hospital data.');
    }
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  const handleHospitalSelect = (hospital) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: hospital.coordinate.latitude,
        longitude: hospital.coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleHospitalSelect(item)}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemDistance}>{item.distance.toFixed(1)}km</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
          >
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={hospital.coordinate}
                title={hospital.title}
                description={hospital.description}
                pinColor="red"
              />
            ))}
          </MapView>
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Nearby Hospitals</Text>
            <FlatList
              data={hospitals}
              renderItem={renderHospitalItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
            />
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{errorMsg ? errorMsg : 'Locating...'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.6, // Map takes 60% of screen
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemDistance: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
