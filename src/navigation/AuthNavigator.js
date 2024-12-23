import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

//Explore MoreScreen
import ExploreMoreScreen from '../screens/Explore/ExploreMoreScreen.js';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Seller Dashboard Screens
import SellerDashboardScreen from '../screens/SellerDashboard/SellerDashboardScreen';
import AddProduct from '../components/SellerDashboard/AddProduct';
import EditProduct from '../components/SellerDashboard/EditProduct.js';

// Buyerr Dashboard Screens
import AllProducts from '../components/BuyerDashboard/AllProducts.js';
import ProductDetails from '../components/BuyerDashboard/ProductDetails.js';
import Cart from '../components/BuyerDashboard/Cart.js';
import BuyerOrder from '../components/BuyerDashboard/BuyerOrder.js';
import SellerOrders from '../components/SellerDashboard/SellerOrder.js';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}> 
       {/* Exolore More Screen */}
   <Stack.Screen name="ExploreMore" component={ExploreMoreScreen} /> 
  
           {/* Auth Screens */}
   <Stack.Screen name="RegisterScreen" component={RegisterScreen} />  
  <Stack.Screen name="LoginScreen" component={LoginScreen} />  

         {/* Seller Dashboard Screens  */}
  <Stack.Screen name="SellerDashboardScreen" component={SellerDashboardScreen} />
  <Stack.Screen name="AddProduct" component={AddProduct} />
  <Stack.Screen name="EditProduct" component={EditProduct} /> 
  <Stack.Screen name="SellerOrder" component={SellerOrders} />

           {/* Buyer Dashboard Screens */}
  <Stack.Screen name="ProductDetails" component={ProductDetails} />

  <Stack.Screen name="Cart" component={Cart} /> 
  <Stack.Screen name="BuyerOrder" component={BuyerOrder} />   
  <Stack.Screen name="AllProducts" component={AllProducts} />  
     
     </Stack.Navigator>
  );
};

export default AppNavigator;

