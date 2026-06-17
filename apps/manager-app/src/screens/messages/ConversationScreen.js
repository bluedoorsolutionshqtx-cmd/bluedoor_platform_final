import React,{
  useEffect,
  useState,
  useCallback
} from 'react';

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

export default function ConversationScreen({
  route
}) {

  const {
    title,
    type
  } = route.params;

  const conversationId =
    title
      .toLowerCase()
      .replaceAll(' ','-');

  const [loading,
    setLoading] =
      useState(true);

  const [refreshing,
    setRefreshing] =
      useState(false);

  const [message,
    setMessage] =
      useState('');

  const [messages,
    setMessages] =
      useState([]);

  const loadMessages =
    useCallback(
      async () => {

        try {

          const response =
            await fetch(
              `${CRM_URL}/api/messages/${conversationId}`
            );

          const data =
            await response.json();

          setMessages(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (err) {

          console.log(
            'MESSAGE LOAD ERROR',
            err
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      [conversationId]
    );

  useEffect(() => {

    loadMessages();

    const interval =
      setInterval(
        loadMessages,
        3000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [loadMessages]);

  async function sendMessage() {

    if (!message.trim()) {
      return;
    }

    try {

      await fetch(
        `${CRM_URL}/api/messages`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            conversation_id:
              conversationId,
            sender:
              'Manager',
            recipient:
              type,
            message
          })
        }
      );

      setMessage('');

      loadMessages();

    } catch (err) {

      console.log(
        'SEND ERROR',
        err
      );

    }

  }

  if (loading) {

    return (

      <View
        style={styles.center}
      >

        <ActivityIndicator
          size="large"
        />

      </View>

    );

  }

  return (

    <View
      style={styles.container}
    >

      <View
        style={styles.header}
      >

        <Text
          style={styles.title}
        >
          {title}
        </Text>

        <Text>
          Status: Online
        </Text>

      </View>

      <FlatList
        data={messages}
        keyExtractor={
          item =>
            String(item.id)
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {

              setRefreshing(
                true
              );

              loadMessages();

            }}
          />
        }
        renderItem={({
          item
        }) => (

          <View
            style={
              item.sender ===
              'Manager'
                ? styles.managerMessage
                : styles.remoteMessage
            }
          >

            <Text
              style={
                styles.sender
              }
            >
              {item.sender}
            </Text>

            <Text>
              {item.message}
            </Text>

            <Text
              style={
                styles.timestamp
              }
            >
              {item.created_at}
            </Text>

          </View>

        )}
      />

      <View
        style={styles.inputBar}
      >

        <TextInput
          value={message}
          onChangeText={
            setMessage
          }
          placeholder="Type message..."
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.send}
          onPress={
            sendMessage
          }
        >

          <Text
            style={{
              color:'#fff',
              fontWeight:'700'
            }}
          >
            Send
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  );

}

const styles =
StyleSheet.create({

  container:{
    flex:1
  },

  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  header:{
    padding:15,
    backgroundColor:'#fff'
  },

  title:{
    fontSize:24,
    fontWeight:'700'
  },

  managerMessage:{
    backgroundColor:'#dbeafe',
    margin:10,
    padding:12,
    borderRadius:10
  },

  remoteMessage:{
    backgroundColor:'#fff',
    margin:10,
    padding:12,
    borderRadius:10
  },

  sender:{
    fontWeight:'700'
  },

  timestamp:{
    marginTop:5,
    fontSize:10
  },

  inputBar:{
    flexDirection:'row',
    padding:10
  },

  input:{
    flex:1,
    backgroundColor:'#fff',
    borderRadius:10,
    padding:10
  },

  send:{
    marginLeft:10,
    paddingHorizontal:20,
    justifyContent:'center',
    backgroundColor:'#2563eb',
    borderRadius:10
  }

});
