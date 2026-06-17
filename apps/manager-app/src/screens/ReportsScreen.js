import React,{
  useEffect,
  useState
} from 'react';

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function ReportsScreen({
  navigation
}){

  const [incidents,
    setIncidents] =
      useState([]);

  const [workOrders,
    setWorkOrders] =
      useState([]);

  const [health,
    setHealth] =
      useState({});

  const [assignment,
    setAssignment] =
      useState({});

  const [notes,
    setNotes] =
      useState({});

  useEffect(()=>{

    loadData();

    const timer =
      setInterval(
        loadData,
        5000
      );

    return () =>
      clearInterval(timer);

  },[]);

  async function loadData(){

    try{

      const [
        incidentRes,
        workOrderRes,
        healthRes
      ] = await Promise.all([
        fetch(
          `${CRM_URL}/api/incidents`
        ),
        fetch(
          `${CRM_URL}/api/work-orders`
        ),
        fetch(
          `${CRM_URL}/api/system-health`
        )
      ]);

      setIncidents(
        await incidentRes.json()
      );

      setWorkOrders(
        await workOrderRes.json()
      );

      setHealth(
        await healthRes.json()
      );

    }catch(err){

      console.log(err);

    }

  }

  async function assignIncident(
    incidentId
  ){

    await fetch(
      `${CRM_URL}/api/incidents/${incidentId}/assign`,
      {
        method:'PUT',
        headers:{
          'Content-Type':
            'application/json'
        },
        body:JSON.stringify({
          assigned_to:
            assignment[
              incidentId
            ] || 'Manager',
          priority:'high',
          due_date:
            new Date(
              Date.now() +
              86400000
            ).toISOString()
        })
      }
    );

    loadData();

  }

  async function saveNotes(
    incidentId
  ){

    await fetch(
      `${CRM_URL}/api/incidents/${incidentId}/notes`,
      {
        method:'PUT',
        headers:{
          'Content-Type':
            'application/json'
        },
        body:JSON.stringify({
          notes:
            notes[
              incidentId
            ] || ''
        })
      }
    );

    loadData();

  }

  async function acknowledge(
    incidentId
  ){

    await fetch(
      `${CRM_URL}/api/incidents/${incidentId}/acknowledge`,
      {
        method:'PUT',
        headers:{
          'Content-Type':
            'application/json'
        },
        body:JSON.stringify({
          user:'Manager'
        })
      }
    );

    loadData();

  }

  async function resolve(
    incidentId
  ){

    await fetch(
      `${CRM_URL}/api/incidents/${incidentId}/resolve`,
      {
        method:'PUT',
        headers:{
          'Content-Type':
            'application/json'
        },
        body:JSON.stringify({
          user:'Manager'
        })
      }
    );

    loadData();

  }

  return(

    <ScrollView
      style={styles.container}
    >

      <Text
        style={styles.header}
      >
        Operations Command Center
      </Text>

      <View style={styles.card}>

        <Text style={styles.title}>
          Operations Overview
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={()=>
            navigation.navigate(
              'WorkOrders'
            )
          }
        >

          <Text
            style={styles.buttonText}
          >
            Open Work Orders
          </Text>

        </TouchableOpacity>

      </View>

      <View style={styles.card}>

        <Text style={styles.title}>
          Work Order Metrics
        </Text>

        <Text>
          Total:
          {' '}
          {workOrders.length}
        </Text>

        <Text>
          Open:
          {' '}
          {
            workOrders.filter(
              w =>
                w.status ===
                'open'
            ).length
          }
        </Text>

        <Text>
          Completed:
          {' '}
          {
            workOrders.filter(
              w =>
                w.status ===
                'completed'
            ).length
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.title}>
          System Health
        </Text>

        <Text>
          CRM:
          {' '}
          {health.crm}
        </Text>

        <Text>
          PostgreSQL:
          {' '}
          {health.postgres}
        </Text>

        <Text>
          Redis:
          {' '}
          {health.redis}
        </Text>

        <Text>
          Dispatch:
          {' '}
          {health.dispatch}
        </Text>

        <Text>
          Audit:
          {' '}
          {health.audit}
        </Text>

      </View>

      <Text
        style={styles.sectionHeader}
      >
        Incident Management
      </Text>

      {
        incidents.map(
          incident => (

            <View
              key={
                incident.incident_id
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
                {
                  incident.incident_id
                }
              </Text>

              <Text>
                Status:
                {' '}
                {
                  incident.status
                }
              </Text>

              <Text>
                Severity:
                {' '}
                {
                  incident.severity
                }
              </Text>

              <Text>
                Priority:
                {' '}
                {
                  incident.priority ||
                  'medium'
                }
              </Text>

              <Text>
                Assigned:
                {' '}
                {
                  incident.assigned_to ||
                  'Unassigned'
                }
              </Text>

              <TextInput
                style={
                  styles.input
                }
                placeholder="Assign Owner"
                value={
                  assignment[
                    incident.incident_id
                  ] || ''
                }
                onChangeText={
                  value =>
                    setAssignment(
                      prev => ({
                        ...prev,
                        [
                          incident.incident_id
                        ]:value
                      })
                    )
                }
              />

              <TouchableOpacity
                style={
                  styles.assignButton
                }
                onPress={()=>
                  assignIncident(
                    incident.incident_id
                  )
                }
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Assign
                </Text>

              </TouchableOpacity>

              <TextInput
                style={
                  styles.input
                }
                placeholder="Resolution Notes"
                multiline
                value={
                  notes[
                    incident.incident_id
                  ] || ''
                }
                onChangeText={
                  value =>
                    setNotes(
                      prev => ({
                        ...prev,
                        [
                          incident.incident_id
                        ]:value
                      })
                    )
                }
              />

              <TouchableOpacity
                style={
                  styles.notesButton
                }
                onPress={()=>
                  saveNotes(
                    incident.incident_id
                  )
                }
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Save Notes
                </Text>

              </TouchableOpacity>

              {
                incident.status ===
                'open' && (

                  <TouchableOpacity
                    style={
                      styles.ackButton
                    }
                    onPress={()=>
                      acknowledge(
                        incident.incident_id
                      )
                    }
                  >

                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Acknowledge
                    </Text>

                  </TouchableOpacity>

                )
              }

              {
                incident.status !==
                'resolved' && (

                  <TouchableOpacity
                    style={
                      styles.resolveButton
                    }
                    onPress={()=>
                      resolve(
                        incident.incident_id
                      )
                    }
                  >

                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Resolve
                    </Text>

                  </TouchableOpacity>

                )
              }

            </View>

          )
        )
      }

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
    fontSize:30,
    fontWeight:'700',
    marginBottom:20
  },

  sectionHeader:{
    fontSize:22,
    fontWeight:'700',
    marginBottom:15
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginBottom:15
  },

  title:{
    fontSize:18,
    fontWeight:'700',
    marginBottom:10
  },

  input:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    padding:10,
    marginTop:10
  },

  navButton:{
    backgroundColor:'#2563eb',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  assignButton:{
    backgroundColor:'#2563eb',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  notesButton:{
    backgroundColor:'#7c3aed',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  ackButton:{
    backgroundColor:'#f59e0b',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  resolveButton:{
    backgroundColor:'#16a34a',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  buttonText:{
    color:'#fff',
    textAlign:'center',
    fontWeight:'700'
  }

});
