import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          console.log('No user is logged in.');
          return;
        }

        console.log('Fetching orders for user:', user.uid);
        const ordersSnapshot = await firestore()
          .collection('orders')
          .where('sellerId', '==', user.uid)
          .get();

        if (!ordersSnapshot.empty) {
          const ordersList = ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersList);
          console.log('Orders fetched:', ordersList);
        } else {
          setOrders([]);
          console.log('No orders found for this seller.');
        }
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        Alert.alert('Error', 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      await firestore().collection('orders').doc(orderId).update({ status: 'Accepted' });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'Accepted' } : order
        )
      );
      Alert.alert('Success', 'Order accepted successfully');
      console.log('Order accepted:', orderId);
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await firestore().collection('orders').doc(orderId).update({ status: 'Rejected' });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'Rejected' } : order
        )
      );
      Alert.alert('Success', 'Order rejected successfully');
      console.log('Order rejected:', orderId);
    } catch (error) {
      console.error('Error rejecting order:', error);
      Alert.alert('Error', 'Failed to reject order');
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
        <Text style={styles.orderStatus}>Status: {item.status || 'Pending'}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptOrder(item.id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectOrder(item.id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading orders...</Text>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders to manage!</Text>
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
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  orderItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#888',
  },
  orderItemQuantity: {
    fontSize: 14,
  },
  orderItemDate: {
    fontSize: 12,
    color: '#888',
  },
  orderStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  noOrdersText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
});

export default SellerOrder;
