import { React, useState, useEffect } from 'react';

import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker'


export default function Address({ route, updateMarker, markerRef, activeMarkerRef, setActiveMarkerRef }) {

  const [information, setInformation] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const { marker } = route.params;


  useEffect(() => {
    if (marker.information) {
      setInformation(marker.information);
    }
    if (marker.selectedValue) {
      setSelectedValue(marker.selectedValue);
    }
  }, []);
  //Päivitetään markerille käyttäjän syöttämä informaatio teksti ja selectedValue(positiivinen, negatiivinen vai neutraali)
  const handleUpdate = () => {
    if (activeMarkerRef && activeMarkerRef.key) {
      updateMarker(activeMarkerRef.key, { information: information, selectedValue: selectedValue });
    } else {
      console.error('Virhe: activeMarkerRef on määrittelemätön tai ei sisällä key-muuttujaa:', activeMarkerRef);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize:25, fontWeight: 'bold'}}>{marker.location}</Text>
      <Text style={{fontSize:20, marginTop:50}}>Tiedot</Text>
      {/*TextInput kentässä määritellään kentälle myös sallituksi useiden rivien kirjoittaminen*/}
      <TextInput 
        style={styles.input}
        textAlignVertical="top" 
        multiline={true} 
        numberOfLines={12} 
        id='information' 
        value={information}
        onChangeText={setInformation}>
      </TextInput>
      <Text style={{fontSize: 20, marginTop:20}}>Valitse arvo:</Text>
      <Picker
        selectedValue={selectedValue}
        style={{ height: 50, width: 150 }}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}>
        <Picker.Item label="Positive" value="positive" />
        <Picker.Item label="Negative" value="negative" />
        <Picker.Item label="Neutral" value="neutral" />
      </Picker>
      {/* Tallenna-nappi */}
      <Button title="Tallenna" onPress={handleUpdate} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50
  },
  input : {
    width:300,
    height: 200, 
    borderColor: 'gray', 
    borderWidth: 1
  }
});