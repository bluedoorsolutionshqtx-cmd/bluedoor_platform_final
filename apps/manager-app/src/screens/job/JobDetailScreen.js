import React,{useEffect,useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

const CRM_URL='http://192.168.1.185:4004';

const NEXT_STATUS={
  dispatched:'en_route',
  en_route:'on_site',
  on_site:'in_progress',
  in_progress:'completed',
  completed:'invoiced',
  invoiced:'paid'
};

export default function JobDetailScreen({route}){

  const {job}=route.params;

  const [loading,setLoading]=useState(true);

  const [jobData,setJobData]=useState(null);
  const [client,setClient]=useState(null);
  const [property,setProperty]=useState(null);
  const [invoice,setInvoice]=useState(null);
  const [payment,setPayment]=useState(null);
  const [audit,setAudit]=useState([]);

  useEffect(()=>{
    loadData();
  },[]);

  async function loadData(){

    try{

      const [
        jobRes,
        clientRes,
        propertyRes,
        invoiceRes,
        paymentRes,
        auditRes
      ] = await Promise.all([
        fetch(`${CRM_URL}/api/jobs/${job.job_id}`),
        fetch(`${CRM_URL}/api/jobs/${job.job_id}/client`),
        fetch(`${CRM_URL}/api/jobs/${job.job_id}/property`),
        fetch(`${CRM_URL}/api/jobs/${job.job_id}/invoice`),
        fetch(`${CRM_URL}/api/jobs/${job.job_id}/payment`),
        fetch(`${CRM_URL}/api/jobs/${job.job_id}/audit`)
      ]);

      setJobData(await jobRes.json());
      setClient(await clientRes.json());
      setProperty(await propertyRes.json());
      setInvoice(await invoiceRes.json());
      setPayment(await paymentRes.json());
      setAudit(await auditRes.json());

    }catch(err){

      console.log(err);

    }finally{

      setLoading(false);

    }

  }

  async function advanceStatus(){

    const next =
      NEXT_STATUS[
        jobData.status
      ];

    if(!next){
      return;
    }

    await fetch(
      `${CRM_URL}/api/jobs/${job.job_id}/status`,
      {
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          status:next
        })
      }
    );

    loadData();

  }

  if(loading){

    return(
      <View style={styles.center}>
        <ActivityIndicator size="large"/>
      </View>
    );

  }

  return(

    <ScrollView style={styles.container}>

      <Text style={styles.header}>
        {jobData?.job_id}
      </Text>

      <View style={styles.card}>
        <Text style={styles.section}>
          Workflow
        </Text>

        <Text>
          Status: {jobData?.status}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={advanceStatus}
        >

          <Text
            style={styles.buttonText}
          >
            Advance Workflow
          </Text>

        </TouchableOpacity>

      </View>

      <View style={styles.card}>
        <Text style={styles.section}>
          Client
        </Text>

        {client && (
          <>
            <Text>
              {client.first_name}
              {' '}
              {client.last_name}
            </Text>
            <Text>
              {client.email}
            </Text>
          </>
        )}

      </View>

      <View style={styles.card}>
        <Text style={styles.section}>
          Property
        </Text>

        {property && (
          <>
            <Text>
              {property.property_name}
            </Text>
            <Text>
              {property.address_1}
            </Text>
            <Text>
              {property.city},
              {' '}
              {property.state}
            </Text>
          </>
        )}

      </View>

      <View style={styles.card}>
        <Text style={styles.section}>
          Invoice
        </Text>

        {invoice && (
          <>
            <Text>
              {invoice.invoice_id}
            </Text>
            <Text>
              ${invoice.amount}
            </Text>
          </>
        )}

      </View>

      <View style={styles.card}>
        <Text style={styles.section}>
          Payment
        </Text>

        {payment && (
          <>
            <Text>
              {payment.payment_id}
            </Text>
            <Text>
              ${payment.amount}
            </Text>
          </>
        )}

      </View>

      <View style={styles.card}>

        <Text style={styles.section}>
          Workflow Timeline
        </Text>

        {
          audit.length === 0
          ? (
            <Text>
              No Workflow Events
            </Text>
          )
          : (
            audit.map(
              (event,index)=>{

                let payload={};

                try{
                  payload=
                    typeof event.payload ===
                    'string'
                    ? JSON.parse(
                        event.payload
                      )
                    : event.payload;
                }catch{}

                return(

                  <View
                    key={index}
                    style={
                      styles.timelineItem
                    }
                  >

                    <Text
                      style={
                        styles.timelineTitle
                      }
                    >
                      {event.event_type}
                    </Text>

                    <Text>
                      {
                        payload.oldStatus
                      }
                      {' → '}
                      {
                        payload.newStatus
                      }
                    </Text>

                    <Text>
                      {
                        event.created_at
                      }
                    </Text>

                  </View>

                );

              }
            )
          )
        }

      </View>

    </ScrollView>

  );

}

const styles=StyleSheet.create({

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

  button:{
    backgroundColor:'#2563eb',
    padding:12,
    borderRadius:8,
    marginTop:10
  },

  buttonText:{
    color:'#fff',
    textAlign:'center',
    fontWeight:'700'
  },

  timelineItem:{
    borderLeftWidth:3,
    paddingLeft:10,
    marginBottom:12
  },

  timelineTitle:{
    fontWeight:'700'
  }

});
