import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ProductDetails = ({ route }) => {
  const { product } = route.params;
  const [cartAdded, setCartAdded] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const productDoc = await firestore()
          .collection('products')
          .doc(product.id)
          .get();
        if (productDoc.exists) {
          const fetchedComments = productDoc.data().comments || [];
          console.log('Fetched comments:', fetchedComments); // Debugging line

          // Ensure the comments are in an array of objects with {user, id, text}
          if (Array.isArray(fetchedComments)) {
            setComments(fetchedComments);
          } else {
            setComments([]); // If the comments data is not an array, set to an empty array.
          }
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [product.id]);

  const handleAddToCart = async () => {
    try {
      const user = auth().currentUser;
      await firestore().collection('cart').add({
        userId: user.uid,
        productId: product.id,
        ...product,
      });
      setCartAdded(true);
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleOrderProduct = async () => {
    const { name, address, phone } = userDetails;

    // Validate input fields
    if (!name || !address || !phone) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const user = auth().currentUser;

      // Fetch the product document from Firestore
      const productDoc = await firestore()
        .collection('products')
        .doc(product.id)
        .get();

      // Check if the product exists
      if (!productDoc.exists) {
        Alert.alert('Error', 'Product not found.');
        return;
      }

      // Fetch sellerId from the product document
      const sellerId = productDoc.data().sellerId;

      // Check if sellerId exists
      if (!sellerId) {
        Alert.alert('Error', 'Seller not found.');
        return;
      }

      // Create the order document for the buyer
      const orderRef = await firestore().collection('orders').add({
        userId: user.uid,
        sellerId: sellerId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        userDetails,
        orderDate: new Date(),
        productImage: product.imageUrl,
        status: 'Pending',  // Set initial status of the order
      });

      // Add the order to the seller's orders subcollection
      await firestore()
        .collection('sellers')
        .doc(sellerId)
        .collection('orders')
        .add({
          orderId: orderRef.id,  // Reference to the created order
          productName: product.name,
          userName: user.displayName,
          userId: user.uid,
          orderDate: new Date(),
          orderStatus: 'Pending',  // You can update the status later
          productPrice: product.price,
          productImage: product.imageUrl,
        });

      // Close the order modal
      setOrderModalVisible(false);

      // Alert user that the order has been placed successfully
      Alert.alert('Success', 'Your order has been placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place the order.');
    }
  };

  const handleInputChange = (field, value) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleAddComment = async () => {
    if (!comment) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    try {
      const productDoc = await firestore()
        .collection('products')
        .doc(product.id);
      const newComments = [...comments, { text: comment, user: auth().currentUser.uid, id: Date.now().toString() }];

      await productDoc.update({
        comments: newComments,
      });

      setComments(newComments);
      setComment('');
      Alert.alert('Success', 'Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>${product.price}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cartButton]}
          onPress={handleAddToCart}
          disabled={cartAdded}
        >
          <Text style={styles.buttonText}>
            {cartAdded ? 'Added to Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.orderButton]}
          onPress={() => setOrderModalVisible(true)}
        >
          <Text style={styles.buttonText}>Order Now</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        {comments.length > 0 ? (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id} // Ensure each comment has a unique 'id'
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noCommentsText}>No comments yet.</Text>
        )}

        {/* Add Comment Section */}
        <TextInput
          style={styles.input}
          placeholder="Add a comment"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={[styles.button, styles.addCommentButton]}
          onPress={handleAddComment}
        >
          <Text style={styles.buttonText}>Add Comment</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={orderModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={userDetails.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={userDetails.address}
              onChangeText={(value) => handleInputChange('address', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={userDetails.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
            />
            <TouchableOpacity
              style={[styles.button, styles.orderButton]}
              onPress={handleOrderProduct}
            >
              <Text style={styles.buttonText}>Confirm Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setOrderModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    minHeight: 50,
  },
  cartButton: {
    backgroundColor: '#4CAF50',
  },
  orderButton: {
    backgroundColor: '#087f23',
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  commentText: {
    fontSize: 16,
    color: '#333',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  addCommentButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 50,  // Increased padding to allow more space inside the modal
    borderRadius: 10,
    width: '80%',
    maxHeight: '110%', // Adjust this to prevent the content from overflowing
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default ProductDetails;
