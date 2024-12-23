import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Modal, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Cart = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    address: '',
    paymentMethod: '',
  });
  const [placeAllOrderModalVisible, setPlaceAllOrderModalVisible] = useState(false);
  const userId = auth().currentUser?.uid;

  // Fetch cart items on mount and listen for real-time updates
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('cart')
      .where('userId', '==', userId)
      .onSnapshot(
        (querySnapshot) => {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          setCartItems(items); // Update state with current cart items
        },
        (error) => {
          console.error('Error fetching cart items:', error);
        }
      );

    return () => unsubscribe(); // Cleanup listener
  }, [userId]);

  // Function to remove item permanently from Firestore
  const handleRemoveItem = async (itemId) => {
    try {
      const itemRef = firestore().collection('cart').doc(itemId);
  
      // Delete the item from Firestore
      await itemRef.delete();
  
      // Check if it is deleted successfully from Firestore
      const snapshot = await itemRef.get();
      if (!snapshot.exists) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        Alert.alert('Removed', 'Item removed from cart.');
      } else {
        Alert.alert('Error', 'Item could not be removed.');
      }
    } catch (error) {
      console.error('Error removing item:', error.message);
      Alert.alert('Error', 'Failed to remove item.');
    }
  };
  

  // Function to place an order for all items in the cart
  const handlePlaceAllOrder = async () => {
    if (!orderDetails.address || !orderDetails.paymentMethod) {
      Alert.alert('Incomplete Details', 'Please provide address and payment method.');
      return;
    }

    try {
      const batch = firestore().batch(); // Use batch for atomic operations

      cartItems.forEach((item) => {
        // Add each item to the "orders" collection
        const orderRef = firestore().collection('orders').doc();
        batch.set(orderRef, {
          userId: userId,
          productId: item.productId,
          productName: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          address: orderDetails.address,
          paymentMethod: orderDetails.paymentMethod,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        // Remove each item from the "cart" collection
        const cartRef = firestore().collection('cart').doc(item.id);
        batch.delete(cartRef);
      });

      await batch.commit(); // Execute the batch operation

      setCartItems([]); // Clear local state after placing order
      setPlaceAllOrderModalVisible(false); // Close modal
      Alert.alert('Order Placed', 'Your order has been successfully placed.');
    } catch (error) {
      console.error('Error placing order:', error.message);
      Alert.alert('Error', 'Failed to place the order.');
    }
  };

  // Render each cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
          />
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => setPlaceAllOrderModalVisible(true)} // Show the modal to take order details
          >
            <Text style={styles.orderButtonText}>Order All</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal for order details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={placeAllOrderModalVisible}
        onRequestClose={() => setPlaceAllOrderModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Address"
              placeholderTextColor="#aaa"
              value={orderDetails.address}
              onChangeText={(text) => setOrderDetails({ ...orderDetails, address: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Payment Method"
              placeholderTextColor="#aaa"
              value={orderDetails.paymentMethod}
              onChangeText={(text) => setOrderDetails({ ...orderDetails, paymentMethod: text })}
            />
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePlaceAllOrder}
            >
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setPlaceAllOrderModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1fdf1',
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  details: {
    marginLeft: 10,
    justifyContent: 'space-around',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  price: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
  },
  orderButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});

export default Cart;
