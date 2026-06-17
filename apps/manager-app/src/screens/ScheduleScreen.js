import React,{
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function ScheduleScreen({
  navigation
}) {

  const [loading,
    setLoading] =
      useState(true);

  const [jobs,
    setJobs] =
      useState([]);

  useEffect(() => {

    loadJobs();

    const interval =
      setInterval(
        loadJobs,
        5000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  async function loadJobs() {

    try {

      const response =
        await fetch(
          `${CRM_URL}/api/dispatch-jobs`
        );

      const data =
        await response.json();

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(
        'DISPATCH LOAD ERROR',
        err
      );

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

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

      <Text
        style={styles.header}
      >
        Dispatch Board
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

          <TouchableOpacity
            style={styles.card}
            onPress={() =>

              navigation.navigate(
                'JobDetail',
                {
                  job:item
                }
              )

            }
          >

            <Text
              style={styles.job}
            >
              {item.job_id}
            </Text>

            <Text>
              Route:
              {' '}
              {item.route_id}
            </Text>

            <Text>
              Crew:
              {' '}
              {item.crew_id}
            </Text>

            <Text>
              Status:
              {' '}
              {item.status}
            </Text>

            <Text>
              Dispatched:
              {' '}
              {item.dispatched_at}
            </Text>

            <Text
              style={
                styles.detail
              }
            >
              Tap To Open →
            </Text>

          </TouchableOpacity>

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
    fontSize:30,
    fontWeight:'700',
    marginBottom:15
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginBottom:12
  },

  job:{
    fontSize:18,
    fontWeight:'700',
    marginBottom:5
  },

  detail:{
    marginTop:10,
    color:'#2563eb',
    fontWeight:'700'
  }

});
