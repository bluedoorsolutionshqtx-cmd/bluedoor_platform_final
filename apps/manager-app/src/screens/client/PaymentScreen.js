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

export default function PaymentScreen() {

  const [loading,
    setLoading] =
      useState(true);

  const [payments,
    setPayments] =
      useState([]);

  useEffect(() => {

    async function load() {

      try {

        const response =
          await fetch(
            `${CRM_URL}/api/payments`
          );

        const data =
          await response.json();

        setPayments(data);

      } catch (err) {

        console.log(
          'PAYMENT LOAD ERROR',
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
        Payment History
      </Text>

      <FlatList
        data={payments}
        keyExtractor={
          item =>
            item.payment_id
        }
        renderItem={({
          item
        }) => (

          <View style={styles.card}>

            <Text style={styles.title}>
              Payment:
              {' '}
              {item.payment_id}
            </Text>

            <Text>
              Invoice:
              {' '}
              {item.invoice_id}
            </Text>

            <Text>
              Amount:
              {' '}
              ${item.amount}
            </Text>

            <Text>
              Status:
              {' '}
              {item.status}
            </Text>

            <Text>
              Received:
              {' '}
              {item.received_at}
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
