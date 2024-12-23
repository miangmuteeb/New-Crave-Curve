import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, Alert, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const BuyerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = auth().currentUser;
        const ordersSnapshot = await firestore()
          .collection('orders')
          .where('userId', '==', user.uid)
          .get();

        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleRemoveOrder = async (orderId) => {
    try {
      await firestore().collection('orders').doc(orderId).delete();
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      Alert.alert('Success', 'Order removed successfully');
    } catch (error) {
      console.error('Error removing order:', error);
      Alert.alert('Error', 'Failed to remove order');
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.productImage }} style={styles.orderItemImage} />
      <View style={styles.orderItemDetails}>
        <Text style={styles.orderItemName}>{item.productName}</Text>
        <Text style={styles.orderItemPrice}>Price: ${item.productPrice}</Text>
        <Text style={styles.orderItemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.orderItemDate}>
          Date: {item.orderDate?.toDate().toLocaleDateString() || 'N/A'}
        </Text>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveOrder(item.id)}>
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You haven't placed any orders yet!</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6ffe6',
    padding: 10,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: '#32CD32',
    borderWidth: 1,
  },
  orderItemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  orderItemDetails: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  orderItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
  },
  orderItemPrice: {
    fontSize: 16,
    color: '#006400',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#006400',
  },
  orderItemDate: {
    fontSize: 14,
    color: '#006400',
  },
  removeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#006400',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default BuyerOrder;
