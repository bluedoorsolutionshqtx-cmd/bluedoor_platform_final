import React from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';

export default function CrewDetailScreen({
  route
}) {

  const {
    crew
  } = route.params;

  return (

    <ScrollView
      style={styles.container}
    >

      <Text
        style={styles.header}
      >
        {crew.crew_id}
      </Text>

      <View
        style={styles.card}
      >

        <Text>
          Status:
          {' '}
          {crew.status}
        </Text>

        <Text>
          Latitude:
          {' '}
          {crew.latitude}
        </Text>

        <Text>
          Longitude:
          {' '}
          {crew.longitude}
        </Text>

      </View>

      <View
        style={styles.card}
      >

        <Text
          style={styles.section}
        >
          Current Job
        </Text>

        <Text>
          JOB-001
        </Text>

      </View>

      <View
        style={styles.card}
      >

        <Text
          style={styles.section}
        >
          Crew Members
        </Text>

        <Text>
          Foreman
        </Text>

        <Text>
          Technician #1
        </Text>

        <Text>
          Technician #2
        </Text>

      </View>

      <View
        style={styles.card}
      >

        <Text
          style={styles.section}
        >
          Today's Metrics
        </Text>

        <Text>
          Jobs Completed: 3
        </Text>

        <Text>
          Revenue: $1,250
        </Text>

        <Text>
          Route Progress: 65%
        </Text>

      </View>

    </ScrollView>

  );

}

const styles =
StyleSheet.create({

  container:{
    flex:1,
    padding:15
  },

  header:{
    fontSize:28,
    fontWeight:'700',
    marginBottom:15
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginBottom:15
  },

  section:{
    fontWeight:'700',
    marginBottom:10
  }

});
