import React,{
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function IncidentListScreen({
  navigation
}){

  const [incidents,setIncidents] =
    useState([]);

  const [search,setSearch] =
    useState('');

  const [statusFilter,setStatusFilter] =
    useState('all');

  const [severityFilter,setSeverityFilter] =
    useState('all');

  const [refreshing,setRefreshing] =
    useState(false);

  useEffect(()=>{

    loadIncidents();

    const timer =
      setInterval(
        loadIncidents,
        30000
      );

    return () =>
      clearInterval(timer);

  },[]);

  async function loadIncidents(){

    try{

      const response =
        await fetch(
          `${CRM_URL}/api/incidents`
        );

      const data =
        await response.json();

      setIncidents(
        Array.isArray(data)
          ? data
          : []
      );

    }catch(err){

      console.log(err);

    }

  }

  async function refresh(){

    setRefreshing(true);

    await loadIncidents();

    setRefreshing(false);

  }

  const metrics =
    useMemo(()=>({

      total:
        incidents.length,

      open:
        incidents.filter(
          x=>x.status==='open'
        ).length,

      acknowledged:
        incidents.filter(
          x=>
            x.status===
            'acknowledged'
        ).length,

      resolved:
        incidents.filter(
          x=>
            x.status===
            'resolved'
        ).length

    }),[incidents]);

  const filtered =
    incidents.filter(item=>{

      const searchMatch =
        (
          item.incident_id || ''
        )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      const statusMatch =
        statusFilter === 'all'
        ||
        item.status ===
        statusFilter;

      const severityMatch =
        severityFilter === 'all'
        ||
        item.severity ===
        severityFilter;

      return (
        searchMatch &&
        statusMatch &&
        severityMatch
      );

    });

  function KPI({
    label,
    value
  }){

    return(

      <View
        style={styles.kpiCard}
      >

        <Text
          style={styles.kpiValue}
        >
          {value}
        </Text>

        <Text>
          {label}
        </Text>

      </View>

    );

  }

  function FilterButton({
    label,
    value,
    selected,
    setSelected
  }){

    const active =
      selected === value;

    return(

      <TouchableOpacity
        style={[
          styles.filterButton,
          active &&
          styles.activeFilter
        ]}
        onPress={()=>
          setSelected(value)
        }
      >

        <Text
          style={[
            styles.filterText,
            active &&
            styles.activeText
          ]}
        >
          {label}
        </Text>

      </TouchableOpacity>

    );

  }

  return(

    <View
      style={styles.container}
    >

      <Text
        style={styles.header}
      >
        Incident Center
      </Text>

      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={()=>
          navigation.navigate(
            'IncidentAnalytics'
          )
        }
      >
        <Text
          style={styles.analyticsButtonText}
        >
          View Analytics
        </Text>
      </TouchableOpacity>

      <View
        style={styles.kpiRow}
      >

        <KPI
          label="Open"
          value={metrics.open}
        />

        <KPI
          label="Acknowledged"
          value={
            metrics.acknowledged
          }
        />

        <KPI
          label="Resolved"
          value={
            metrics.resolved
          }
        />

        <KPI
          label="Total"
          value={
            metrics.total
          }
        />

      </View>

      <TextInput
        style={styles.search}
        placeholder="Search incidents..."
        value={search}
        onChangeText={setSearch}
      />

      <Text
        style={styles.section}
      >
        Status
      </Text>

      <View
        style={styles.filterRow}
      >

        <FilterButton
          label="All"
          value="all"
          selected={
            statusFilter
          }
          setSelected={
            setStatusFilter
          }
        />

        <FilterButton
          label="Open"
          value="open"
          selected={
            statusFilter
          }
          setSelected={
            setStatusFilter
          }
        />

        <FilterButton
          label="Acknowledged"
          value="acknowledged"
          selected={
            statusFilter
          }
          setSelected={
            setStatusFilter
          }
        />

        <FilterButton
          label="Resolved"
          value="resolved"
          selected={
            statusFilter
          }
          setSelected={
            setStatusFilter
          }
        />

      </View>

      <Text
        style={styles.section}
      >
        Severity
      </Text>

      <View
        style={styles.filterRow}
      >

        <FilterButton
          label="All"
          value="all"
          selected={
            severityFilter
          }
          setSelected={
            setSeverityFilter
          }
        />

        <FilterButton
          label="High"
          value="high"
          selected={
            severityFilter
          }
          setSelected={
            setSeverityFilter
          }
        />

        <FilterButton
          label="Medium"
          value="medium"
          selected={
            severityFilter
          }
          setSelected={
            setSeverityFilter
          }
        />

        <FilterButton
          label="Low"
          value="low"
          selected={
            severityFilter
          }
          setSelected={
            setSeverityFilter
          }
        />

      </View>

      <FlatList
        data={filtered}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
        keyExtractor={
          item =>
            item.incident_id
        }
        renderItem={({item})=>(

          <TouchableOpacity
            style={styles.card}
            onPress={()=>
              navigation.navigate(
                'IncidentDetail',
                {
                  incident:item
                }
              )
            }
          >

            <Text
              style={styles.title}
            >
              {item.incident_id}
            </Text>

            <Text>
              Type:
              {' '}
              {item.incident_type}
            </Text>

            <Text>
              Severity:
              {' '}
              {item.severity}
            </Text>

            <Text>
              Status:
              {' '}
              {item.status}
            </Text>

            <Text>
              Assigned:
              {' '}
              {
                item.assigned_to ||
                'Unassigned'
              }
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

  header:{
    fontSize:30,
    fontWeight:'700',
    marginBottom:15
  },

  section:{
    fontSize:18,
    fontWeight:'700',
    marginBottom:8,
    marginTop:10
  },

  search:{
    backgroundColor:'#fff',
    borderRadius:10,
    padding:12,
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

  filterRow:{
    flexDirection:'row',
    flexWrap:'wrap',
    marginBottom:10
  },

  filterButton:{
    backgroundColor:'#e5e7eb',
    paddingHorizontal:14,
    paddingVertical:10,
    borderRadius:8,
    marginRight:8,
    marginBottom:8
  },

  activeFilter:{
    backgroundColor:'#2563eb'
  },

  filterText:{
    fontWeight:'700'
  },

  activeText:{
    color:'#fff'
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginBottom:12
  },

  analyticsButton:{
    backgroundColor:'#2563eb',
    padding:14,
    borderRadius:10,
    marginBottom:15
  },

  analyticsButtonText:{
    color:'#fff',
    textAlign:'center',
    fontWeight:'700'
  },

  title:{
    fontSize:18,
    fontWeight:'700',
    marginBottom:8
  }

});
