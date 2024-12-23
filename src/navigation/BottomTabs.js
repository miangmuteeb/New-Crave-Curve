import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import AllProducts from '../components/BuyerDashboard/AllProducts';  // Adjust the path as necessary
import Cart from '../components/BuyerDashboard/Cart';  // Adjust the path as necessary
import BuyerOrders from '../components/BuyerDashboard/BuyerOrder';  // Adjust the path as necessary

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconSource;

          // Define Flaticon CDN URLs for icons
          if (route.name === 'Home') {
            iconSource = { uri: 'https://img.icons8.com/ios-filled/50/000000/home.png' };  // Home icon from Flaticon CDN
          } else if (route.name === 'Cart') {
            iconSource = { uri: 'https://img.icons8.com/ios-filled/50/000000/shopping-cart.png' };  // Cart icon from Flaticon CDN
          } else if (route.name === 'Orders') {
            iconSource = { uri: 'https://img.icons8.com/ios-filled/50/000000/list.png' };  // Orders icon from Flaticon CDN
          }

          return <Image source={iconSource} style={{ width: size, height: size }} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={AllProducts} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Orders" component={BuyerOrders} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
