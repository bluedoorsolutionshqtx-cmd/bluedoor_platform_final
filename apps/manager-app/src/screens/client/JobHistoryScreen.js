import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function JobHistoryScreen() {

  const [loading,
    setLoading] =
      useState(true);

  const [jobs,
    setJobs] =
      useState([]);

  useEffect(() => {

    async function load() {

      try {

        const response =
          await fetch(
            `${CRM_URL}/api/jobs`
          );

        const data =
          await response.json();

        setJobs(data);

      } catch (err) {

        console.log(
          'JOB LOAD ERROR',
          err
        );

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

      </View>

    );

  }

  return (

    <View style={styles.container}>

      <Text style={styles.header}>
        Job History
      </Text>

      <FlatList
        data={jobs}
        keyExtractor={
          item =>
            item.job_id
        }
        renderItem={({
          item
        }) => (

          <View style={styles.card}>

            <Text style={styles.title}>
              Job:
              {' '}
              {item.job_id}
            </Text>

            <Text>
              Client:
              {' '}
              {item.client_id}
            </Text>

            <Text>
              Property:
              {' '}
              {item.property_id}
            </Text>

            <Text>
              Stage:
              {' '}
              {item.current_stage}
            </Text>

            <Text>
              Status:
              {' '}
              {item.status}
            </Text>

            <Text>
              Updated:
              {' '}
              {item.updated_at}
            </Text>

          </View>

        )}
      />

    </View>

  );

}

const styles =
StyleSheet.create({

  container:{
    flex:1,
    padding:15
  },

  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  header:{
    fontSize:24,
    fontWeight:'700',
    marginBottom:15
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    marginBottom:12,
    borderRadius:10
  },

  title:{
    fontWeight:'700',
    marginBottom:5
  }

});
