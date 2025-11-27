import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hospitals, setHospitals] = useState([]);

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
      generateMockHospitals(location.coords);
    })();
  }, []);

  const generateMockHospitals = (coords) => {
    // Generate 5 mock hospitals around the user
    const mockHospitals = [];
    for (let i = 0; i < 5; i++) {
      mockHospitals.push({
        id: i,
        title: `Hospital ${i + 1}`,
        description: `This is a nearby hospital #${i + 1}`,
        coordinate: {
          latitude: coords.latitude + (Math.random() - 0.5) * 0.01,
          longitude: coords.longitude + (Math.random() - 0.5) * 0.01,
        },
      });
    }
    setHospitals(mockHospitals);
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
