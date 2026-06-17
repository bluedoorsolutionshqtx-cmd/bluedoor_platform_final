import React,{
  useEffect,
  useState
} from 'react';

import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function IncidentDetailScreen({
  route
}){

  const {
    incident
  } = route.params;

  const [details,setDetails] =
    useState(null);

  const [timeline,setTimeline] =
    useState([]);

  const [assignedTo,setAssignedTo] =
    useState('');

  const [notes,setNotes] =
    useState('');

  const [refreshing,setRefreshing] =
    useState(false);

  useEffect(()=>{

    loadIncident();

  },[]);

  async function loadIncident(){

    try{

      const [
        detailRes,
        timelineRes
      ] = await Promise.all([

        fetch(
          `${CRM_URL}/api/incidents/${incident.incident_id}`
        ),

        fetch(
          `${CRM_URL}/api/incidents/${incident.incident_id}/timeline`
        )

      ]);

      const detailData =
        await detailRes.json();

      setDetails(
        detailData
      );

      setTimeline(
        await timelineRes.json()
      );

      setAssignedTo(
        detailData
          ?.assigned_to || ''
      );

      setNotes(
        detailData
          ?.resolution_notes || ''
      );

    }catch(err){

      console.log(err);

    }

  }

  async function refresh(){

    setRefreshing(true);

    await loadIncident();

    setRefreshing(false);

  }

  async function assignIncident(){

    try{

      await fetch(
        `${CRM_URL}/api/incidents/${incident.incident_id}/assign`,
        {
          method:'PUT',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            assigned_to:
              assignedTo
          })
        }
      );

      loadIncident();

    }catch(err){

      console.log(err);

    }

  }

  async function saveNotes(){

    try{

      await fetch(
        `${CRM_URL}/api/incidents/${incident.incident_id}/notes`,
        {
          method:'PUT',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            resolution_notes:
              notes
          })
        }
      );

      loadIncident();

    }catch(err){

      console.log(err);

    }

  }

  async function acknowledge(){

    try{

      await fetch(
        `${CRM_URL}/api/incidents/${incident.incident_id}/acknowledge`,
        {
          method:'PUT',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            user:'Logan'
          })
        }
      );

      loadIncident();

    }catch(err){

      console.log(err);

    }

  }

  async function resolve(){

    try{

      await saveNotes();

      await fetch(
        `${CRM_URL}/api/incidents/${incident.incident_id}/resolve`,
        {
          method:'PUT',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            user:'Logan'
          })
        }
      );

      loadIncident();

    }catch(err){

      console.log(err);

    }

  }

  if(!details){

    return(

      <View style={styles.center}>

        <Text>
          Loading Incident...
        </Text>

      </View>

    );

  }

  return(

    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
        />
      }
    >

      <Text style={styles.header}>
        {details.incident_id}
      </Text>

      <View style={styles.card}>

        <Text style={styles.section}>
          Incident Overview
        </Text>

        <Text>
          Type:
          {' '}
          {details.incident_type}
        </Text>

        <Text>
          Severity:
          {' '}
          {details.severity}
        </Text>

        <Text>
          Status:
          {' '}
          {details.status}
        </Text>

        <Text>
          Job:
          {' '}
          {details.job_id}
        </Text>

        <Text>
          Created:
          {' '}
          {details.created_at}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Assignment
        </Text>

        <TextInput
          style={styles.input}
          value={assignedTo}
          onChangeText={
            setAssignedTo
          }
          placeholder="Assigned user"
        />

        <TouchableOpacity
          style={styles.assignButton}
          onPress={
            assignIncident
          }
        >

          <Text
            style={styles.buttonText}
          >
            Assign Incident
          </Text>

        </TouchableOpacity>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Resolution Notes
        </Text>

        <TextInput
          style={styles.notesInput}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveNotes}
        >

          <Text
            style={styles.buttonText}
          >
            Save Notes
          </Text>

        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.ackButton}
        onPress={acknowledge}
      >

        <Text
          style={styles.buttonText}
        >
          Acknowledge Incident
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resolveButton}
        onPress={resolve}
      >

        <Text
          style={styles.buttonText}
        >
          Resolve Incident
        </Text>

      </TouchableOpacity>

      <View style={styles.card}>

        <Text style={styles.section}>
          Timeline
        </Text>

        {
          timeline.map(
            (
              item,
              index
            )=>(

              <View
                key={index}
                style={styles.timeline}
              >

                <Text
                  style={{
                    fontWeight:'700'
                  }}
                >
                  {item.type}
                </Text>

                <Text>
                  {item.created_at}
                </Text>

              </View>

            )
          )
        }

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

  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
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
    fontSize:18,
    fontWeight:'700',
    marginBottom:10
  },

  input:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    padding:10,
    marginBottom:10
  },

  notesInput:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    padding:10,
    minHeight:120,
    marginBottom:10
  },

  assignButton:{
    backgroundColor:'#2563eb',
    padding:14,
    borderRadius:8
  },

  saveButton:{
    backgroundColor:'#7c3aed',
    padding:14,
    borderRadius:8
  },

  ackButton:{
    backgroundColor:'#f59e0b',
    padding:14,
    borderRadius:8,
    marginBottom:10
  },

  resolveButton:{
    backgroundColor:'#16a34a',
    padding:14,
    borderRadius:8,
    marginBottom:15
  },

  buttonText:{
    color:'#fff',
    textAlign:'center',
    fontWeight:'700'
  },

  timeline:{
    borderBottomWidth:1,
    borderBottomColor:'#eee',
    paddingVertical:10
  }

});
