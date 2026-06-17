import 'react-native-gesture-handler';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RouteScreen from './src/screens/RouteScreen';
import CrewsScreen from './src/screens/CrewsScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

import OperationsDashboardScreen from './src/screens/operations/OperationsDashboardScreen';

import WorkOrdersScreen from './src/screens/workorders/WorkOrdersScreen';
import WorkOrderDetailScreen from './src/screens/workorders/WorkOrderDetailScreen';

import IncidentDetailScreen from './src/screens/incidents/IncidentDetailScreen';
import IncidentAnalyticsScreen from './src/screens/incidents/IncidentAnalyticsScreen';
import IncidentListScreen from './src/screens/incidents/IncidentListScreen';

import ClientDetailScreen from './src/screens/client/ClientDetailScreen';
import InvoiceScreen from './src/screens/client/InvoiceScreen';
import PaymentScreen from './src/screens/client/PaymentScreen';
import JobHistoryScreen from './src/screens/client/JobHistoryScreen';

import ConversationScreen from './src/screens/messages/ConversationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientStack(){

  return(

    <Stack.Navigator>

      <Stack.Screen
        name="ClientList"
        component={ClientsScreen}
        options={{
          title:'Clients'
        }}
      />

      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
      />

      <Stack.Screen
        name="Invoices"
        component={InvoiceScreen}
      />

      <Stack.Screen
        name="Payments"
        component={PaymentScreen}
      />

      <Stack.Screen
        name="Jobs"
        component={JobHistoryScreen}
      />

    </Stack.Navigator>

  );

}

function MessageStack(){

  return(

    <Stack.Navigator>

      <Stack.Screen
        name="MessageHub"
        component={MessagesScreen}
        options={{
          title:'Messages'
        }}
      />

      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
      />

    </Stack.Navigator>

  );

}

function WorkOrderStack(){

  return(

    <Stack.Navigator>

      <Stack.Screen
        name="WorkOrderList"
        component={WorkOrdersScreen}
        options={{
          title:'Work Orders'
        }}
      />

      <Stack.Screen
        name="WorkOrderDetail"
        component={WorkOrderDetailScreen}
      />

    </Stack.Navigator>

  );

}



function IncidentStack(){

  return(

    <Stack.Navigator>

      <Stack.Screen
        name="IncidentList"
        component={IncidentListScreen}
        options={{
          title:'Incidents'
        }}
      />

      <Stack.Screen
        name="IncidentDetail"
        component={IncidentDetailScreen}
        options={{
          title:'Incident'
        }}
      />

      <Stack.Screen
        name="IncidentAnalytics"
        component={IncidentAnalyticsScreen}
        options={{
          title:'Incident Analytics'
        }}
      />

    </Stack.Navigator>

  );

}

\nfunction OperationsStack(){

  return(

    <Stack.Navigator>

      <Stack.Screen
        name="OperationsDashboard"
        component={
          OperationsDashboardScreen
        }
        options={{
          title:
            'Operations Command Center'
        }}
      />

      <Stack.Screen
        name="WorkOrderDetail"
        component={
          WorkOrderDetailScreen
        }
        options={{
          title:'Work Order'
        }}
      />

      <Stack.Screen
        name="IncidentDetail"
        component={
          IncidentDetailScreen
        }
        options={{
          title:'Incident'
        }}
      />

    </Stack.Navigator>

  );

}

export default function App(){

  return(

    <NavigationContainer>

      <Tab.Navigator>

        <Tab.Screen
          name="Route"
          component={RouteScreen}
        />

        <Tab.Screen
          name="Crews"
          component={CrewsScreen}
        />

        <Tab.Screen
          name="Clients"
          component={ClientStack}
          options={{
            headerShown:false
          }}
        />

        <Tab.Screen
          name="Messages"
          component={MessageStack}
          options={{
            headerShown:false
          }}
        />

        <Tab.Screen
          name="Schedule"
          component={ScheduleScreen}
        />

        <Tab.Screen
          name="WorkOrders"
          component={WorkOrderStack}
          options={{
            headerShown:false
          }}
        />

        <Tab.Screen
          name="Incidents"
          component={IncidentStack}
          options={{
            headerShown:false
          }}
        />

        <Tab.Screen
          name="Operations"
          component={OperationsStack}
          options={{
            headerShown:false
          }}
        />

      </Tab.Navigator>

    </NavigationContainer>

  );

}
