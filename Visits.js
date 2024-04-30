import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';


export default function Visits({ route }){
    const [visits, setVisits] = useState([])
    const { markers } = route.params;



    useEffect(() => {
        if (markers) {
          setVisits(markers);
        }

      }, []);
    return (
        <View style={styles.container}>
          <Text style={{fontSize:20, marginTop:50, marginBottom: 50}} >Visits</Text>
          {visits.map((visit, index) => (
            <View key={index}>
              <Text>Date: {visit.date}</Text>
              <Text>Location: {visit.location}</Text>
              {/* Lisää muut tiedot tarvittaessa */}
            </View>
          ))}
        </View>
      );
    }

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          marginTop: 50
        },
      });