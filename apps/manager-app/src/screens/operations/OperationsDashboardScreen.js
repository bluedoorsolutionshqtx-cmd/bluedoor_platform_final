import React,{
  useEffect,
  useState
} from 'react';

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function OperationsDashboardScreen({
  navigation
}){

  const [dashboard,setDashboard] =
    useState(null);

  const [refreshing,setRefreshing] =
    useState(false);

  useEffect(()=>{

    loadDashboard();

    const timer =
      setInterval(
        loadDashboard,
        30000
      );

    return () =>
      clearInterval(timer);

  },[]);

  async function loadDashboard(){

    try{

      const response =
        await fetch(
          `${CRM_URL}/api/operations/executive-dashboard`
        );

      const data =
        await response.json();

      setDashboard(data);

    }catch(err){

      console.log(err);

    }

  }

  async function refresh(){

    setRefreshing(true);

    await loadDashboard();

    setRefreshing(false);

  }

  if(!dashboard){

    return(

      <View style={styles.center}>

        <Text>
          Loading Operations Command Center...
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
        Operations Command Center
      </Text>

      <View style={styles.kpiRow}>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {dashboard.workOrders?.total || 0}
          </Text>
          <Text>Total Work Orders</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {dashboard.incidents?.open || 0}
          </Text>
          <Text>Open Incidents</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            $
            {dashboard.revenue?.today || 0}
          </Text>
          <Text>Revenue Today</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {dashboard.sla?.overdue || 0}
          </Text>
          <Text>SLA Violations</Text>
        </View>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Active Alerts
        </Text>

        {
          dashboard.activeAlerts?.length
          ? dashboard.activeAlerts.map(
              (alert,index)=>(

                <View
                  key={index}
                  style={styles.alert}
                >

                  <Text>
                    {alert.type}
                  </Text>

                  <Text>
                    {
                      alert.title ||
                      alert.incidentId
                    }
                  </Text>

                </View>

              )
            )
          : (
              <Text>
                No Active Alerts
              </Text>
            )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Overdue Work Orders
        </Text>

        {
          dashboard.overdueWorkOrders?.length
          ? dashboard.overdueWorkOrders.map(
              item=>(

                <TouchableOpacity
                  key={
                    item.work_order_id
                  }
                  style={styles.row}
                  onPress={()=>
                    navigation.navigate(
                      'WorkOrderDetail',
                      {
                        workOrder:item
                      }
                    )
                  }
                >

                  <View>

                    <Text
                      style={
                        styles.rowTitle
                      }
                    >
                      {item.title}
                    </Text>

                    <Text>
                      {item.status}
                    </Text>

                  </View>

                  <Text>
                    →
                  </Text>

                </TouchableOpacity>

              )
            )
          : (
              <Text>
                No Overdue Work Orders
              </Text>
            )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Open Incidents
        </Text>

        {
          dashboard.openIncidents?.length
          ? dashboard.openIncidents.map(
              item=>(

                <TouchableOpacity
                  key={
                    item.incident_id
                  }
                  style={styles.row}
                  onPress={()=>
                    navigation.navigate(
                      'IncidentDetail',
                      {
                        incident:item
                      }
                    )
                  }
                >

                  <View>

                    <Text
                      style={
                        styles.rowTitle
                      }
                    >
                      {item.incident_id}
                    </Text>

                    <Text>
                      Severity:
                      {' '}
                      {item.severity}
                    </Text>

                  </View>

                  <Text>
                    →
                  </Text>

                </TouchableOpacity>

              )
            )
          : (
              <Text>
                No Open Incidents
              </Text>
            )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Revenue
        </Text>

        <Text>
          Invoiced:
          {' '}
          $
          {
            dashboard.revenue
              ?.invoices || 0
          }
        </Text>

        <Text>
          Collected:
          {' '}
          $
          {
            dashboard.revenue
              ?.payments || 0
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          System Status
        </Text>

        <Text>
          Healthy:
          {' '}
          {
            dashboard.sla
              ?.healthy || 0
          }
        </Text>

        <Text>
          Overdue:
          {' '}
          {
            dashboard.sla
              ?.overdue || 0
          }
        </Text>

        <Text>
          Generated:
        </Text>

        <Text>
          {
            dashboard.generatedAt
          }
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

  kpiRow:{
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'space-between',
    marginBottom:15
  },

  kpiCard:{
    width:'48%',
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginBottom:10
  },

  kpiValue:{
    fontSize:24,
    fontWeight:'700'
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

  row:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingVertical:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  },

  rowTitle:{
    fontWeight:'700'
  },

  alert:{
    backgroundColor:'#f3f4f6',
    padding:10,
    borderRadius:8,
    marginBottom:8
  }

});
