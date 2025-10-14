import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen_new';
import RELATORIO from './src/screens/RELATORIO';
import StatisticsScreen from './src/screens/StatisticsScreen_new';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animationEnabled: true, // suaviza as transições
        tabBarActiveTintColor: '#07cf18ff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#000000' },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName

          switch (route.name) {
            case 'Início':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Estatísticas':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Câmera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Relatórios':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Estatísticas" component={StatisticsScreen} />
      <Tab.Screen name="Câmera" component={CameraScreen} />
      <Tab.Screen name="Relatórios" component={RELATORIO} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="App" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
