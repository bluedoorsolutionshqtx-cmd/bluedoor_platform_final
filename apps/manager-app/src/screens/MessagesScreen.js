import React, {
  useEffect,
  useState
} from 'react';

import {
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native';

const CRM_URL =
  'http://192.168.1.185:4004';

function MessageCard({
  title,
  unread,
  subtitle,
  onPress
}) {

  return (

    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >

      <View
        style={styles.row}
      >

        <Text
          style={styles.title}
        >
          {title}
        </Text>

        {
          unread > 0 && (

            <View
              style={styles.badge}
            >

              <Text
                style={styles.badgeText}
              >
                {unread}
              </Text>

            </View>

          )
        }

      </View>

      <Text
        style={styles.subtitle}
      >
        {subtitle}
      </Text>

    </TouchableOpacity>

  );

}

export default function MessagesScreen({
  navigation
}) {

  const [loading,
    setLoading] =
      useState(true);

  const [conversations,
    setConversations] =
      useState([]);

  useEffect(() => {

    loadConversations();

  }, []);

  async function loadConversations() {

    try {

      const response =
        await fetch(
          `${CRM_URL}/api/conversations`
        );

      const data =
        await response.json();

      setConversations(
        data
      );

    } catch (err) {

      console.log(
        'CONVERSATION LOAD ERROR',
        err
      );

    } finally {

      setLoading(false);

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

    <ScrollView
      style={styles.container}
    >

      <Text
        style={styles.header}
      >
        Messages
      </Text>

      {
        conversations.map(
          conversation => (

            <MessageCard
              key={
                conversation.conversation_id
              }
              title={
                conversation.title
              }
              unread={
                conversation.unread_count || 0
              }
              subtitle={
                conversation.last_message ||
                'No messages'
              }
              onPress={() =>

                navigation.navigate(
                  'Conversation',
                  {
                    title:
                      conversation.title,
                    type:
                      conversation.conversation_type
                  }
                )

              }
            />

          )
        )
      }

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
    fontSize:32,
    fontWeight:'700',
    marginBottom:20
  },

  card:{
    backgroundColor:'#fff',
    padding:15,
    marginBottom:12,
    borderRadius:10
  },

  row:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },

  title:{
    fontSize:18,
    fontWeight:'700'
  },

  subtitle:{
    marginTop:6
  },

  badge:{
    minWidth:24,
    height:24,
    borderRadius:12,
    backgroundColor:'red',
    justifyContent:'center',
    alignItems:'center',
    paddingHorizontal:6
  },

  badgeText:{
    color:'#fff',
    fontWeight:'700'
  }

});
