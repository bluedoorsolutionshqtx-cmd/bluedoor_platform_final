import React,{
  useEffect,
  useState
} from 'react';

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function IncidentAnalyticsScreen(){

  const [analytics,setAnalytics] =
    useState(null);

  const [refreshing,setRefreshing] =
    useState(false);

  useEffect(()=>{

    loadAnalytics();

    const timer =
      setInterval(
        loadAnalytics,
        30000
      );

    return () =>
      clearInterval(timer);

  },[]);

  async function loadAnalytics(){

    try{

      const response =
        await fetch(
          `${CRM_URL}/api/incidents/analytics`
        );

      const data =
        await response.json();

      setAnalytics(data);

    }catch(err){

      console.log(err);

    }

  }

  async function refresh(){

    setRefreshing(true);

    await loadAnalytics();

    setRefreshing(false);

  }

  if(!analytics){

    return(

      <View style={styles.center}>

        <Text>
          Loading Incident Analytics...
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
        Incident Analytics
      </Text>

      <View style={styles.kpiRow}>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {analytics.totals?.total || 0}
          </Text>
          <Text>Total</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {analytics.totals?.open || 0}
          </Text>
          <Text>Open</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {analytics.totals?.resolved || 0}
          </Text>
          <Text>Resolved</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {analytics.resolutionRate || 0}%
          </Text>
          <Text>Resolution Rate</Text>
        </View>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Executive Summary
        </Text>

        <Text>
          Total Incidents:
          {' '}
          {
            analytics.executiveSummary
              ?.totalIncidents || 0
          }
        </Text>

        <Text>
          Active Incidents:
          {' '}
          {
            analytics.executiveSummary
              ?.activeIncidents || 0
          }
        </Text>

        <Text>
          Resolved:
          {' '}
          {
            analytics.executiveSummary
              ?.resolvedIncidents || 0
          }
        </Text>

        <Text>
          MTTR:
          {' '}
          {
            analytics.executiveSummary
              ?.mttrHours || 0
          }
          h
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Severity Distribution
        </Text>

        <Text>
          High:
          {' '}
          {
            analytics
              .severityDistribution
              ?.high || 0
          }
        </Text>

        <Text>
          Medium:
          {' '}
          {
            analytics
              .severityDistribution
              ?.medium || 0
          }
        </Text>

        <Text>
          Low:
          {' '}
          {
            analytics
              .severityDistribution
              ?.low || 0
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          SLA Metrics
        </Text>

        <Text>
          MTTR:
          {' '}
          {
            analytics.sla
              ?.mttrHours || 0
          }
          h
        </Text>

        <Text>
          Avg Ack Time:
          {' '}
          {
            analytics.sla
              ?.avgAckHours || 0
          }
          h
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Incident Trend
        </Text>

        {
          analytics.incidentTrend?.length
          ? analytics.incidentTrend.map(
              (item,index)=>(

                <View
                  key={index}
                  style={styles.row}
                >

                  <Text>
                    {item.date}
                  </Text>

                  <Text>
                    {item.count}
                  </Text>

                </View>

              )
            )
          : (
              <Text>
                No Trend Data
              </Text>
            )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Top Incident Types
        </Text>

        {
          analytics.topIncidentTypes?.length
          ? analytics.topIncidentTypes.map(
              (item,index)=>(

                <View
                  key={index}
                  style={styles.row}
                >

                  <Text>
                    {item.type}
                  </Text>

                  <Text>
                    {item.count}
                  </Text>

                </View>

              )
            )
          : (
              <Text>
                No Type Data
              </Text>
            )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Generated
        </Text>

        <Text>
          {analytics.generatedAt}
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
    paddingVertical:8,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  }

});
