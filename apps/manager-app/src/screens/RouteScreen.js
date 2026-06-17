import React from 'react';

import {
  View,
  Text,
  StyleSheet
} from 'react-native';

import MapView, {
  Marker,
  Polyline
} from 'react-native-maps';

export default function RouteScreen() {

  const stops = [
    {
      id:'1',
      title:'John Smith',
      latitude:33.1384,
      longitude:-96.1108
    },
    {
      id:'2',
      title:'Sarah Johnson',
      latitude:33.1450,
      longitude:-96.1050
    },
    {
      id:'3',
      title:'Robert Davis',
      latitude:33.1510,
      longitude:-96.0990
    }
  ];

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Today's Route
        </Text>

        <Text>
          Stops: 3
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude:33.1384,
          longitude:-96.1108,
          latitudeDelta:0.05,
          longitudeDelta:0.05
        }}
      >

        {stops.map(stop => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude:stop.latitude,
              longitude:stop.longitude
            }}
            title={stop.title}
          />
        ))}

        <Polyline
          coordinates={
            stops.map(stop => ({
              latitude:stop.latitude,
              longitude:stop.longitude
            }))
          }
          strokeWidth={4}
        />

      </MapView>

      <View style={styles.bottomCard}>
        <Text style={styles.nextStop}>
          Next Stop
        </Text>

        <Text>
          John Smith
        </Text>

        <Text>
          Landscape Estimate
        </Text>

        <Text>
          09:00 AM
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1
  },

  header:{
    padding:15,
    backgroundColor:'#fff'
  },

  title:{
    fontSize:24,
    fontWeight:'700'
  },

  map:{
    flex:1
  },

  bottomCard:{
    padding:15,
    backgroundColor:'#fff'
  },

  nextStop:{
    fontSize:18,
    fontWeight:'700'
  }

});
