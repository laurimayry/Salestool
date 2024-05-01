import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { API_KEY, FB_API_KEY } from '@env';
//FireBase importit
//Tuodaan osoitenäkymä, johon käyttäjä pääsee painamalla olemassa olevaa sijaintimerkkiä
import Address from './Address';
import Visits from './Visits';
//import { useReducedMotion } from 'react-native-reanimated';
import { getDatabase, push, ref, onValue, remove, update } from 'firebase/database';
import { initializeApp } from "firebase/app";


//Firebase konfigurointi
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "salestool-418816.firebaseapp.com",
  databaseURL: "https://salestool-418816-default-rtdb.firebaseio.com",
  projectId: "salestool-418816",
  storageBucket: "salestool-418816.appspot.com",
  messagingSenderId: "258763939880",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);



export default function App() {

  const Stack = createStackNavigator();
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [markerRef, setMarkerRef] = useState(null); // Lisää tilamuuttuja markerRef
  const [activeMarkerRef, setActiveMarkerRef] = useState(null);


//Luodaan yhteys tietokantaan, ja markers luokka
  useEffect(() => {
    const itemsRef = ref(database, 'markers/')
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsArray = Object.entries(data).map(([key, value]) => ({ key, ...value }));
        setMarkers(itemsArray);
      } else {
        setMarkers([]);
      }
    });
  }, [markerRef]);

//Funktio tallentaa käyttäjän luoman sijaintimerkin tietokantaan
const saveMarker = (newMarker) => {
  const newRef = push(ref(database, 'markers/'), newMarker);
  setMarkerRef(newRef);
  newRef
    .then(() => {
      console.log('Tietokantaan tallennettu:', newMarker);
    })
    .catch((error) => {
      console.error('Virhe tallennettaessa tietokantaan:', error);
    });
}

  //Funktio päivittää markerin. Tarvitaan esimerksiksi Addres.js komponentissa, kun käyttäjä tallentaa markerille information tekstiä.
  const updateMarker = (markerId, updatedData) => {
    const markerRef = ref(database, `markers/${markerId}`);
    update(markerRef, updatedData)
      .then(() => {
        console.log('Markerin tiedot päivitetty onnistuneesti');
      })
      .catch((error) => {
        console.error('Virhe markerin tietojen päivityksessä:', error);
      });
  };

      // Funktio poistaa kaikki markerit tietokannasta
  const deleteAllMarkers = () => {
    remove(ref(database, 'markers/'))
      .then(() => {
        console.log('Kaikki merkit poistettu tietokannasta');
        setMarkers([]); // Päivitetään myös tila paikallisesti
        setActiveMarker(null)
      })
      .catch((error) => {
        console.error('Virhe poistettaessa merkkejä tietokannasta:', error);
      });
  }
  
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
        const now = new Date().toISOString().slice(0, 10); // Luo nykyisen päivämäärän muodossa "YYYY-MM-DD"
        const newMarker = {
          id: markers.length,
          coordinate,
          location,
          date: now // Lisää kirjauspäivämäärän
        };
        setMarkers([...markers, newMarker]);
        // Tallennetaan uusi sijainti tietokantaan
        saveMarker(newMarker);
      } else {
        console.error('Geokoodaus epäonnistui:', data.status);
      }
    } catch (error) {
      console.error('Virhe:', error);
    }
  };

  // Käsittele markerin painallus
  const handleMarkerPress = (marker) => {

    console.log('markerref',markerRef)

    setActiveMarker(marker);
    setActiveMarkerRef(markerRef)

    /*if (activeMarker === null){
      setActiveMarker(marker);
      //console.log('Active',activeMarker);
    }
    else{
      setActiveMarker(null);
     // console.log('Active',activeMarker);
    }

    */
  };

  useEffect(() => {
    console.log('Active marker changed:', activeMarker);
  }, [activeMarker]);

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
              //title={activeMarker ? activeMarker.location : null}
              title={marker.location}
              //Asettaa painetun markerin aktiiviseksi
              onPress={() => handleMarkerPress(marker)}
            />
          ))}
        </MapView>

      <Button onPress={deleteAllMarkers} title='Delete All'></Button>
      {/*"Tiedot" Button siirtää käyttäjän aktiivisena olevan Markerin tietoihin*/}
      <Button 
        onPress={() => {
          if (activeMarker) {
            navigation.navigate('Address', { marker: activeMarker, saveMarker: saveMarker, updateMarker: updateMarker, markerRef: markerRef, activeMarkerRef: activeMarkerRef });
          }
        }} 
        title='Tiedot'
      />
      <Button 
        onPress={() => {
          navigation.navigate('Visits', {markers: markers});
        }}
        title='Visits'
        />
    </View>
    )}
    </Stack.Screen>
    <Stack.Screen name="Address">
      {(props) => <Address {...props} saveMarker={saveMarker} updateMarker={updateMarker} markerRef={markerRef} activeMarkerRef={activeMarkerRef} setActiveMarkerRef={setActiveMarkerRef} />}
    </Stack.Screen>
    <Stack.Screen name="Visits">
      {(props) => <Visits {...props}/>}
    </Stack.Screen>
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
