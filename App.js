import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { API_KEY } from '@env';

//Tuodaan osoitenäkymä, johon käyttäjä pääsee painamalla olemassa olevaa sijaintimerkkiä
import Address from './Address';

export default function App() {

  const Stack = createStackNavigator();
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);


  
  //Kartan painallus, luo sijaintimerkin siihen, mistä käyttäjä painaa
  const handleMapPress = async (event, navigation) => {
    const { coordinate } = event.nativeEvent;
    const { latitude, longitude } = coordinate;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const location = data.results[0].formatted_address;
        console.log('Sijainti:', location);
        const newMarker = {
          id: markers.length,
          coordinate,
          location,
        };
        setMarkers([...markers, newMarker]);
      } else {
        console.error('Geokoodaus epäonnistui:', data.status);
      }
    } catch (error) {
      console.error('Virhe:', error);
    }
  };

  // Käsittele markerin painallus
  const handleMarkerPress = (marker) => {
    setActiveMarker(marker);
  };


  const deleteAllMarkers = () => {
    setMarkers([])
    console.log('Poistit kaikki merkit')
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Karttanäkymä" options={{ headerShown: false }}>
        {({ navigation }) => (
      <View style={styles.container}>
        <MapView
          style={{ height: 600, width: 1000}}
          initialRegion={{
            latitude: 60.200692,
            longitude: 24.934302,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          }}
          onPress={handleMapPress}>
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.location}
              //Asettaa painetun markerin aktiiviseksi
              onPress={() => handleMarkerPress(marker)}
            />
          ))}
        </MapView>

      <Button onPress={deleteAllMarkers} title='Delete All'></Button>
      {/*Tiedot Button siirtää käyttäjän aktiivisena olevan Markerin tietoihin*/}
      <Button 
        onPress={() => {
          if (activeMarker) {
            navigation.navigate('Address', { marker: activeMarker });
          }
        }} 
        title='Tiedot'
      />
    </View>
    )}
    </Stack.Screen>
        <Stack.Screen name="Address" component={Address} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
