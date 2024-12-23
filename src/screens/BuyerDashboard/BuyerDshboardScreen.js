import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import auth from '@react-native-firebase/auth';

const { width: windowWidth } = Dimensions.get('window');

const BuyerDashboardScreen = ({ navigation }) => {
  const scrollViewRef = useRef();

  const carouselImages = [
    'https://img.freepik.com/premium-photo/pizza-slice-presentation-dark-background_495832-1715.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid',
    'https://img.freepik.com/free-photo/side-lamb-ragout-with-fried-onion-carrot-tomato-sauce-greens-vegetable-salad-table_141793-4744.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid',
    'https://img.freepik.com/free-photo/high-angle-delicious-sweets-plate_23-2149192016.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid'
  ];

  const sections = [
    {
      title: 'View All Products',
      imageUrl: 'https://img.freepik.com/free-photo/flexitarian-diet-with-copy-space_23-2148862635.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid',
      navigateTo: 'AllProducts'
    },
    {
      title: 'Your Cart',
      imageUrl: 'https://img.freepik.com/premium-vector/food-cart-vendor_1056-1267.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid',
      navigateTo: 'Cart'
    },
    {
      title: 'Your Orders',
      imageUrl: 'https://img.freepik.com/free-photo/people-taking-photos-food_23-2149303524.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_hybrid',
      navigateTo: 'BuyerOrder'
    }
  ];

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <View style={styles.header}>
        <Text style={styles.title}>Buyer Dashboard</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {carouselImages.map((image, index) => (
          <View key={index} style={styles.carouselItem}>
            <Image source={{ uri: image }} style={styles.carouselImage} />
          </View>
        ))}
      </ScrollView>

      {sections.map((section, index) => (
        <TouchableOpacity
          key={index}
          style={styles.section}
          onPress={() => navigation.navigate(section.navigateTo)}
        >
          <Image source={{ uri: section.imageUrl }} style={styles.sectionImage} />
          <View style={styles.textOverlay}>
            <Text style={styles.sectionText}>{section.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  carousel: {
    marginTop: 10,
  },
  carouselItem: {
    width: windowWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: windowWidth - 40,
    height: 200,
    borderRadius: 10,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  section: {
    margin: 20,
    height: 150,  // Ensure the section has a fixed height to display the content
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  sectionText: {
    color: '#FFD700',
    fontSize: 24,
    textAlign: 'center',
  },
});

export default BuyerDashboardScreen;
