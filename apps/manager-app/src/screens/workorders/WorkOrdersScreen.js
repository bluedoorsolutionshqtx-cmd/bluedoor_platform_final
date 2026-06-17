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

export default function WorkOrdersScreen({
  navigation
}){

  const [workOrders,setWorkOrders] =
    useState([]);

  const [statusFilter,setStatusFilter] =
    useState('all');

  const [priorityFilter,setPriorityFilter] =
    useState('all');

  const [search,setSearch] =
    useState('');

  const [refreshing,setRefreshing] =
    useState(false);

  useEffect(()=>{

    loadWorkOrders();

    const timer =
      setInterval(
        loadWorkOrders,
        30000
      );

    return ()=>{

      clearInterval(
        timer
      );

    };

  },[]);

  async function loadWorkOrders(){

    try{

      const response =
        await fetch(
          `${CRM_URL}/api/work-orders`
        );

      const data =
        await response.json();

      setWorkOrders(
        Array.isArray(data)
          ? data
          : []
      );

    }catch(err){

      console.log(err);

    }

  }

  async function onRefresh(){

    setRefreshing(true);

    await loadWorkOrders();

    setRefreshing(false);

  }

  const metrics = useMemo(()=>({

    total:
      workOrders.length,

    open:
      workOrders.filter(
        x=>x.status==='open'
      ).length,

    inProgress:
      workOrders.filter(
        x=>x.status==='in_progress'
      ).length,

    completed:
      workOrders.filter(
        x=>x.status==='completed'
      ).length

  }),[workOrders]);

  const filteredWorkOrders =
    workOrders.filter(item=>{

      const searchMatch =
        (
          item.title || ''
        )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
        ||
        (
          item.job_id || ''
        )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      const statusMatch =
        statusFilter==='all'
        ||
        item.status===statusFilter;

      const priorityMatch =
        priorityFilter==='all'
        ||
        item.priority===priorityFilter;

      return (
        searchMatch &&
        statusMatch &&
        priorityMatch
      );

    });

  function isOverdue(
    workOrder
  ){

    if(
      !workOrder.created_at
    ){

      return false;

    }

    const created =
      new Date(
        workOrder.created_at
      );

    const ageHours =
      (
        Date.now() -
        created.getTime()
      ) /
      1000 /
      60 /
      60;

    return (
      ageHours > 24 &&
      workOrder.status !==
      'completed'
    );

  }

  function slaRemaining(
    workOrder
  ){

    if(
      !workOrder.created_at
    ){

      return '--';

    }

    const created =
      new Date(
        workOrder.created_at
      );

    const due =
      created.getTime() +
      (
        24 *
        60 *
        60 *
        1000
      );

    const diff =
      due - Date.now();

    if(
      diff <= 0
    ){

      return 'OVERDUE';

    }

    const hours =
      Math.floor(
        diff /
        1000 /
        60 /
        60
      );

    return `${hours}h`;

  }

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
    current,
    setter
  }){

    const active =
      current===value;

    return(

      <TouchableOpacity
        style={[
          styles.filterButton,
          active &&
          styles.activeFilter
        ]}
        onPress={()=>
          setter(value)
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
        Work Orders
      </Text>

      <View
        style={styles.kpiRow}
      >

        <KPI
          label="Open"
          value={metrics.open}
        />

        <KPI
          label="In Progress"
          value={metrics.inProgress}
        />

        <KPI
          label="Completed"
          value={metrics.completed}
        />

        <KPI
          label="Total"
          value={metrics.total}
        />

      </View>

      <TextInput
        style={styles.search}
        placeholder="Search..."
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
          current={statusFilter}
          setter={setStatusFilter}
        />

        <FilterButton
          label="Open"
          value="open"
          current={statusFilter}
          setter={setStatusFilter}
        />

        <FilterButton
          label="In Progress"
          value="in_progress"
          current={statusFilter}
          setter={setStatusFilter}
        />

        <FilterButton
          label="Completed"
          value="completed"
          current={statusFilter}
          setter={setStatusFilter}
        />

      </View>

      <Text
        style={styles.section}
      >
        Priority
      </Text>

      <View
        style={styles.filterRow}
      >

        <FilterButton
          label="All"
          value="all"
          current={priorityFilter}
          setter={setPriorityFilter}
        />

        <FilterButton
          label="High"
          value="high"
          current={priorityFilter}
          setter={setPriorityFilter}
        />

        <FilterButton
          label="Medium"
          value="medium"
          current={priorityFilter}
          setter={setPriorityFilter}
        />

        <FilterButton
          label="Low"
          value="low"
          current={priorityFilter}
          setter={setPriorityFilter}
        />

      </View>

      <FlatList
        data={filteredWorkOrders}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        keyExtractor={
          item =>
            item.work_order_id
        }
        renderItem={({item})=>{

          const overdue =
            isOverdue(item);

          return(

            <TouchableOpacity
              style={[
                styles.card,
                overdue &&
                styles.overdueCard
              ]}
              onPress={()=>
                navigation.navigate(
                  'WorkOrderDetail',
                  {
                    workOrder:item
                  }
                )
              }
            >

              <Text
                style={styles.title}
              >
                {item.title}
              </Text>

              <Text>
                Job: {item.job_id}
              </Text>

              <Text>
                Crew: {item.assigned_crew}
              </Text>

              <Text>
                Priority: {item.priority}
              </Text>

              <Text>
                Status: {item.status}
              </Text>

              <Text>
                SLA: {slaRemaining(item)}
              </Text>

              {
                overdue &&
                (
                  <Text
                    style={
                      styles.overdueText
                    }
                  >
                    OVERDUE
                  </Text>
                )
              }

            </TouchableOpacity>

          );

        }}
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
    fontSize:32,
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
    padding:12,
    borderRadius:10,
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
    fontSize:28,
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

  overdueCard:{
    borderWidth:2,
    borderColor:'#dc2626'
  },

  overdueText:{
    color:'#dc2626',
    fontWeight:'700',
    marginTop:8
  },

  title:{
    fontSize:20,
    fontWeight:'700',
    marginBottom:8
  }

});
