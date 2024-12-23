import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const AddProduct = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel || response.errorCode) return;
      setImage(response.assets[0].uri);
    });
  };

  const uploadImageToStorage = async (uri) => {
    const filename = `products/${Date.now()}_${Math.random()}.jpg`;
    const reference = storage().ref(filename);

    try {
      await reference.putFile(uri);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !price || !description || !restaurantName || !image) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to add a product.');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Upload image to Firebase Storage and get the URL
      const imageUrl = await uploadImageToStorage(image);

      // Prepare product data
      const productData = {
        name: productName,
        price: parseFloat(price),
        description,
        category,
        restaurantName,
        imageUrl,
        sellerId: currentUser.uid,
        createdAt: new Date(),
      };

      // Add product to Firestore
      await firestore().collection('products').add(productData);

      Alert.alert('Success', 'Product added successfully!');
      setProductName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setRestaurantName('');
      setImage(null);
      navigation.navigate('SellerDashboardScreen');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Something went wrong! Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Product Name" 
        onChangeText={setProductName} 
        value={productName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Price" 
        keyboardType="numeric" 
        onChangeText={setPrice} 
        value={price} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Description" 
        onChangeText={setDescription} 
        value={description} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Category" 
        onChangeText={setCategory} 
        value={category} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Restaurant Name" 
        onChangeText={setRestaurantName} 
        value={restaurantName} 
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAddProduct} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Product</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // White background
    justifyContent: 'center',
  },
  title: {
    color: '#4CAF50', // Green color for title
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  input: {
    backgroundColor: '#f0f0f0', // Light background for inputs
    color: '#000',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#4CAF50', // Green button
    padding: 15,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff', // White text on the button
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default AddProduct;
