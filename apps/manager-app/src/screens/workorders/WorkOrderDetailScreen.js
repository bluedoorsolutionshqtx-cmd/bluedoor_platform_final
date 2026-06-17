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
  Image,
  RefreshControl
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function WorkOrderDetailScreen({
  route
}){

  const {
    workOrder
  } = route.params;

  const [refreshing,setRefreshing] =
    useState(false);

  const [execution,setExecution] =
    useState(null);

  const [media,setMedia] =
    useState([]);

  const [signoff,setSignoff] =
    useState(null);

  const [acceptance,setAcceptance] =
    useState(null);

  const [invoice,setInvoice] =
    useState(null);

  const [payment,setPayment] =
    useState(null);

  const [audit,setAudit] =
    useState([]);

  const [laborHours,setLaborHours] =
    useState('');

  const [materials,setMaterials] =
    useState('');

  const [notes,setNotes] =
    useState('');

  useEffect(()=>{

    loadData();

  },[]);

  async function loadData(){

    try{

      const [
        executionRes,
        mediaRes,
        signoffRes,
        acceptanceRes,
        invoiceRes,
        paymentRes,
        auditRes
      ] = await Promise.all([

        fetch(
          `${CRM_URL}/api/work-orders/${workOrder.work_order_id}/execution`
        ),

        fetch(
          `${CRM_URL}/api/work-orders/${workOrder.work_order_id}/media`
        ),

        fetch(
          `${CRM_URL}/api/work-orders/${workOrder.work_order_id}/signoff`
        ),

        fetch(
          `${CRM_URL}/api/work-orders/${workOrder.work_order_id}/acceptance`
        ),

        fetch(
          `${CRM_URL}/api/jobs/${workOrder.job_id}/invoice`
        ),

        fetch(
          `${CRM_URL}/api/jobs/${workOrder.job_id}/payment`
        ),

        fetch(
          `${CRM_URL}/api/work-orders/${workOrder.work_order_id}/audit`
        )

      ]);

      const executionData =
        await executionRes.json();

      setExecution(executionData);

      setMedia(
        await mediaRes.json()
      );

      setSignoff(
        await signoffRes.json()
      );

      setAcceptance(
        await acceptanceRes.json()
      );

      setInvoice(
        await invoiceRes.json()
      );

      setPayment(
        await paymentRes.json()
      );

      setAudit(
        await auditRes.json()
      );

      if(executionData){

        setLaborHours(
          String(
            executionData.labor_hours || ''
          )
        );

        setMaterials(
          executionData.materials_used || ''
        );

        setNotes(
          executionData.crew_notes || ''
        );

      }

    }catch(err){

      console.log(err);

    }

  }

  async function refresh(){

    setRefreshing(true);

    await loadData();

    setRefreshing(false);

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
        {workOrder.title}
      </Text>

      <View style={styles.card}>

        <Text style={styles.section}>
          Overview
        </Text>

        <Text>
          Job: {workOrder.job_id}
        </Text>

        <Text>
          Crew: {workOrder.assigned_crew}
        </Text>

        <Text>
          Priority: {workOrder.priority}
        </Text>

        <Text>
          Status:
          {' '}
          {
            execution?.status ||
            workOrder.status
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Workflow Status
        </Text>

        <Text>
          Signoff:
          {' '}
          {
            signoff
              ? 'Completed'
              : 'Pending'
          }
        </Text>

        <Text>
          Acceptance:
          {' '}
          {
            acceptance?.accepted
              ? 'Accepted'
              : 'Pending'
          }
        </Text>

        <Text>
          Invoice:
          {' '}
          {
            invoice?.status ||
            'Not Generated'
          }
        </Text>

        <Text>
          Payment:
          {' '}
          {
            payment?.status ||
            'Unpaid'
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Execution Metrics
        </Text>

        <Text>
          Labor Hours:
          {' '}
          {laborHours}
        </Text>

        <Text>
          Materials:
          {' '}
          {materials}
        </Text>

        <Text>
          Notes:
          {' '}
          {notes}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Timeline
        </Text>

        <Text>
          Created
        </Text>

        <Text>
          Assigned
        </Text>

        <Text>
          Started
        </Text>

        <Text>
          Completed
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Audit History
        </Text>

        {
          Array.isArray(audit)
          &&
          audit.map(
            item => (

              <View
                key={item.id}
                style={{
                  marginBottom:10
                }}
              >

                <Text>
                  {item.event_type}
                </Text>

                <Text>
                  {item.created_at}
                </Text>

              </View>

            )
          )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Media History
        </Text>

        {
          media.map(
            item => (

              <View
                key={item.id}
                style={{
                  marginBottom:15
                }}
              >

                <Text>
                  {item.media_type}
                </Text>

                <Image
                  source={{
                    uri:
                      `${CRM_URL}${item.file_url}`
                  }}
                  style={{
                    width:'100%',
                    height:200,
                    borderRadius:8
                  }}
                />

              </View>

            )
          )
        }

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Customer Signoff
        </Text>

        <Text>
          {
            signoff?.customer_name ||
            'Pending'
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Customer Acceptance
        </Text>

        <Text>
          {
            acceptance?.accepted
              ? 'Accepted'
              : 'Pending'
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Invoice
        </Text>

        <Text>
          Amount:
          {' '}
          $
          {
            invoice?.amount ||
            '0.00'
          }
        </Text>

        <Text>
          Status:
          {' '}
          {
            invoice?.status ||
            'None'
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Payment
        </Text>

        <Text>
          Status:
          {' '}
          {
            payment?.status ||
            'Unpaid'
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
  }

});
