import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import {
  useNavigation
} from '@react-navigation/native';

import {
  getClients,
  getProperties
} from '../services/clientApi';

export default function ClientsScreen() {

  const navigation =
    useNavigation();

  const [clients,
    setClients] =
      useState([]);

  const [properties,
    setProperties] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [selectedClient,
    setSelectedClient] =
      useState(null);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const clientData =
        await getClients();

      const propertyData =
        await getProperties();

      setClients(clientData);
      setProperties(propertyData);

    } catch (err) {

      console.log(
        'CLIENT LOAD ERROR',
        err
      );

    } finally {

      setLoading(false);

    }

  }

  function getClientProperties(
    clientId
  ) {

    return properties.filter(
      property =>
        property.client_id ===
        clientId
    );

  }

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
        Clients
      </Text>

      <FlatList
        data={clients}
        keyExtractor={
          item => item.id
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              setSelectedClient(
                item
              )
            }
          >

            <Text style={styles.name}>
              {item.first_name}
              {' '}
              {item.last_name}
            </Text>

            <Text>
              {item.company_name}
            </Text>

            <Text>
              {item.email}
            </Text>

          </TouchableOpacity>

        )}
      />

      <Modal
        visible={
          !!selectedClient
        }
        animationType="slide"
        onRequestClose={() =>
          setSelectedClient(
            null
          )
        }
      >

        {selectedClient && (

          <View style={styles.modal}>

            <Text
              style={
                styles.modalTitle
              }
            >
              {
                selectedClient.first_name
              }
              {' '}
              {
                selectedClient.last_name
              }
            </Text>

            <Text>
              Email:
              {' '}
              {
                selectedClient.email
              }
            </Text>

            <Text>
              Phone:
              {' '}
              {
                selectedClient.phone
              }
            </Text>

            <Text>
              Company:
              {' '}
              {
                selectedClient.company_name
              }
            </Text>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Properties
            </Text>

            {
              getClientProperties(
                selectedClient.id
              ).map(
                property => (

                <View
                  key={
                    property.id
                  }
                  style={
                    styles.propertyCard
                  }
                >

                  <Text>
                    {
                      property.property_name
                    }
                  </Text>

                  <Text>
                    {
                      property.address_1
                    }
                  </Text>

                  <Text>
                    {
                      property.city
                    }
                    ,
                    {' '}
                    {
                      property.state
                    }
                  </Text>

                </View>

              ))
            }

            <TouchableOpacity
              style={
                styles.button
              }
              onPress={() => {

                const id =
                  selectedClient.id;

                setSelectedClient(
                  null
                );

                navigation.navigate(
                  'Invoices',
                  {
                    clientId:id
                  }
                );

              }}
            >
              <Text>
                View Invoices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.button
              }
              onPress={() => {

                const id =
                  selectedClient.id;

                setSelectedClient(
                  null
                );

                navigation.navigate(
                  'Payments',
                  {
                    clientId:id
                  }
                );

              }}
            >
              <Text>
                View Payments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.button
              }
              onPress={() => {

                const id =
                  selectedClient.id;

                setSelectedClient(
                  null
                );

                navigation.navigate(
                  'Jobs',
                  {
                    clientId:id
                  }
                );

              }}
            >
              <Text>
                Job History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={() =>
                setSelectedClient(
                  null
                )
              }
            >
              <Text>
                Close
              </Text>
            </TouchableOpacity>

          </View>

        )}

      </Modal>

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

  name:{
    fontSize:18,
    fontWeight:'700'
  },

  modal:{
    flex:1,
    padding:25
  },

  modalTitle:{
    fontSize:28,
    fontWeight:'700',
    marginBottom:20
  },

  sectionTitle:{
    marginTop:20,
    marginBottom:10,
    fontWeight:'700'
  },

  propertyCard:{
    padding:10,
    borderWidth:1,
    borderRadius:8,
    marginBottom:10
  },

  button:{
    padding:15,
    borderWidth:1,
    borderRadius:10,
    marginTop:15,
    alignItems:'center'
  },

  closeButton:{
    padding:15,
    borderWidth:1,
    borderRadius:10,
    marginTop:40,
    alignItems:'center'
  }

});
