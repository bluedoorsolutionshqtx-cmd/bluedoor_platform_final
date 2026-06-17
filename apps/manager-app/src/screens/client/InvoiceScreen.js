import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator
} from 'react-native';

export default function InvoiceScreen() {

  const [loading,
    setLoading] =
      useState(true);

  const [invoices,
    setInvoices] =
      useState([]);

  useEffect(() => {

    async function load() {

      try {

        const response =
          await fetch(
            'http://192.168.1.185:4004/api/invoices'
          );

        const data =
          await response.json();

        setInvoices(data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {

    return (
      <ActivityIndicator
        size="large"
      />
    );

  }

  return (

    <FlatList
      data={invoices}
      keyExtractor={
        item =>
          item.invoice_id
      }
      renderItem={({
        item
      }) => (

        <View
          style={{
            padding:15,
            borderBottomWidth:1
          }}
        >

          <Text>
            Invoice:
            {' '}
            {item.invoice_id}
          </Text>

          <Text>
            Job:
            {' '}
            {item.job_id}
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

        </View>

      )}
    />

  );

}
