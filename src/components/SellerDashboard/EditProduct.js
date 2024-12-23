import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = auth().currentUser;

        if (!user) {
          Alert.alert('Error', 'User not authenticated!');
          return;
        }

        const sellerId = user.uid;
        const productsSnapshot = await firestore()
          .collection('products')
          .where('sellerId', '==', sellerId)
          .get();

        const productList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  const handleDeleteProduct = async (productId, imageUrl) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Delete the image from Firebase Storage
            const reference = storage().refFromURL(imageUrl);
            await reference.delete();

            // Delete the product from Firestore
            await firestore().collection('products').doc(productId).delete();

            setProducts(products.filter((product) => product.id !== productId));
            Alert.alert('Success', 'Product deleted successfully!');
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product.');
          }
        },
      },
    ]);
  };

  const handleEditProduct = async (product) => {
    setCurrentProduct(product);
    setNewImage(product.imageUrl);
    setModalVisible(true);
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel || response.errorCode) return;
      setNewImage(response.assets[0].uri);
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

  const handleSaveChanges = async () => {
    setSaving(true);

    try {
      const updatedProduct = { ...currentProduct };

      // If a new image is selected, upload it to Firebase Storage
      if (newImage && newImage !== currentProduct.imageUrl) {
        // Delete the old image
        const reference = storage().refFromURL(currentProduct.imageUrl);
        await reference.delete();

        // Upload the new image
        const imageUrl = await uploadImageToStorage(newImage);
        updatedProduct.imageUrl = imageUrl;
      }

      // Update the product details in Firestore
      await firestore().collection('products').doc(currentProduct.id).update(updatedProduct);

      // Update the local state
      setProducts(products.map((product) => (product.id === currentProduct.id ? updatedProduct : product)));

      Alert.alert('Success', 'Product updated successfully!');
      setModalVisible(false);
      setCurrentProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Price: ${item.price}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleEditProduct(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteProduct(item.id, item.imageUrl)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Products</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.emptyMessage}>No products found</Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Edit Product Modal */}
      {currentProduct && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={currentProduct.name}
              onChangeText={(text) => setCurrentProduct({ ...currentProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={currentProduct.price.toString()}
              keyboardType="numeric"
              onChangeText={(text) => setCurrentProduct({ ...currentProduct, price: parseFloat(text) })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={currentProduct.description}
              onChangeText={(text) => setCurrentProduct({ ...currentProduct, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Restaurant Name"
              value={currentProduct.restaurantName}
              onChangeText={(text) => setCurrentProduct({ ...currentProduct, restaurantName: text })}
            />
            {newImage && <Image source={{ uri: newImage }} style={styles.image} />}
            <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
              <Text style={styles.buttonText}>Change Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4', // White background
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color
    marginBottom: 15,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#fff', // White background for cards
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#4CAF50', // Green border
    borderWidth: 2,
  },
  productName: {
    color: '#333', // Dark text color
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    color: '#4CAF50', // Green price
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50', // Green button
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    width: '40%',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#f44336', // Red button for delete
  },
  buttonText: {
    color: '#fff', // White text for buttons
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#4CAF50', // Green loading text
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  emptyMessage: {
    color: '#777', // Light grey for empty message
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff', // White background for modal
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50', // Green title
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9', // Light grey for input fields
    color: '#333', // Dark text color
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd', // Light grey border for inputs
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd', // Light grey border for image
  },
  cancelButton: {
    backgroundColor: '#f44336', // Red cancel button
    padding: 15,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
  },
});
export default ManageProducts;