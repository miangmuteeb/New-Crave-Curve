import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Linking } from 'react-native';

const SellerDashboardScreen = ({ navigation }) => (
  <View style={styles.container}>
    {/* Shop Now Button */}
    <TouchableOpacity
      style={styles.shopNowButton}
      onPress={() => navigation.navigate('AllProducts')}
    >
      <Text style={styles.shopNowText}>Shop Now</Text>
    </TouchableOpacity>

    <Text style={styles.title}>Seller Dashboard</Text>

    
   

    {/* Add Product Card */}
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AddProduct')}
    >
      <ImageBackground
        source={{ uri: 'https://img.freepik.com/free-photo/black-friday-elements-assortment_23-2149074075.jpg?t=st=1734118518~exp=1734122118~hmac=d0be5c44a1cc0ab3d4ad58349a00d8edf8f5dc1cedc3cb34e8e6804624e7cad7&w=740' }}
        style={styles.cardImage}
      >
        <Text style={styles.cardText}>Add Product</Text>
      </ImageBackground>
    </TouchableOpacity>

    {/* Manage Product Card */}
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EditProduct')}
    >
      <ImageBackground
        source={{ uri: 'https://img.freepik.com/premium-photo/3d-rendering-computer-with-traditional-shop-screen-transportation-background_190619-104.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid' }}
        style={styles.cardImage}
      >
        <Text style={styles.cardText}>Manage Product</Text>
      </ImageBackground>
    </TouchableOpacity>

    {/* Orders Card */}
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SellerOrder')}
    >
      <ImageBackground
        source={{ uri: 'https://img.freepik.com/free-photo/import-export-shipment-truck-graphic-concept_53876-124866.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid' }}
        style={styles.cardImage}
      >
        <Text style={styles.cardText}>Orders</Text>
      </ImageBackground>
    </TouchableOpacity>

   
   
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff', // White background
  },
  shopNowButton: {
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  shopNowText: {
    color: '#fff', // White text on the button
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: '#4CAF50', // Green color for title
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  allProductsLink: {
    color: '#4CAF50', // Green text for the link
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline', // Underline to indicate it's a link
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5, // Adds shadow to the card for elevation effect
  },
  cardImage: {
    width: '100%',
    height: 150, // Adjust the height of the card
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional fallback color if the image doesn't load
  },
  cardText: {
    color: '#fff', // White text for visibility
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for text
  },
});

export default SellerDashboardScreen;
