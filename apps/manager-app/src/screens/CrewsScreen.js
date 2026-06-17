import React,{
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import MapView,{
  Marker
} from 'react-native-maps';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function CrewsScreen() {

  const [loading,
    setLoading] =
      useState(true);

  const [crews,
    setCrews] =
      useState([]);

  useEffect(() => {

    loadCrews();

    const interval =
      setInterval(
        loadCrews,
        5000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  async function loadCrews() {

    try {

      const response =
        await fetch(
          `${CRM_URL}/api/crew-locations`
        );

      const data =
        await response.json();

      setCrews(data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  if (
    loading ||
    crews.length === 0
  ) {

    return (

      <View
        style={styles.center}
      >

        <ActivityIndicator
          size="large"
        />

      </View>

    );

  }

  return (

    <View
      style={styles.container}
    >

      <MapView
        style={styles.map}
        initialRegion={{
          latitude:
            crews[0].latitude,
          longitude:
            crews[0].longitude,
          latitudeDelta:
            0.08,
          longitudeDelta:
            0.08
        }}
      >

        {
          crews.map(
            crew => (

              <Marker
                key={
                  crew.crew_id
                }
                coordinate={{
                  latitude:
                    Number(
                      crew.latitude
                    ),
                  longitude:
                    Number(
                      crew.longitude
                    )
                }}
                title={
                  crew.crew_id
                }
                description={
                  crew.status
                }
              />

            )
          )
        }

      </MapView>

      <View
        style={styles.panel}
      >

        {
          crews.map(
            crew => (

              <View
                key={
                  crew.crew_id
                }
                style={
                  styles.card
                }
              >

                <Text
                  style={
                    styles.title
                  }
                >
                  {crew.crew_id}
                </Text>

                <Text>
                  Status:
                  {' '}
                  {crew.status}
                </Text>

              </View>

            )
          )
        }

      </View>

    </View>

  );

}

const styles =
StyleSheet.create({

  container:{
    flex:1
  },

  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  map:{
    flex:1
  },

  panel:{
    maxHeight:220,
    backgroundColor:'#f5f5f5'
  },

  card:{
    padding:12,
    borderBottomWidth:1,
    borderBottomColor:'#ddd'
  },

  title:{
    fontWeight:'700'
  }

});
