import React from 'react';
import { View, Text } from 'react-native';

export default function Address({ route }) {

    const { marker } = route.params;


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Address: {marker.location}</Text>
    </View>
  );
}