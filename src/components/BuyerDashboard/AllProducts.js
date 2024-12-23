import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartAdded, setCartAdded] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const navigation = useNavigation();

  // Screen dimensions for responsive layout
  const screenWidth = Dimensions.get('window').width;
  const columns = screenWidth > 600 ? 3 : 2;

  // Carousel ref for auto-scrolling
  const carouselRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position

  // Fetch products and categories from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productSnapshot = await firestore().collection('products').get();
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categorySnapshot = await firestore().collection('categories').get();
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();

    // Auto-scroll the carousel
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (Math.floor(scrollPosition / screenWidth) + 1) % 3; // Change 3 to the number of items
        carouselRef.current.scrollToIndex({ animated: true, index: nextIndex });
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [scrollPosition]);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      const user = auth().currentUser;
      await firestore().collection('cart').add({
        userId: user.uid,
        productId: product.id,
        ...product,
      });
      setCartAdded([...cartAdded, product.id]);
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Sorting the products based on the selected sort order
  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.price - b.price; // Ascending order
    } else {
      return b.price - a.price; // Descending order
    }
  });

  // Handle Bottom Tab navigation
  const handleTabPress = (tab) => {
    switch (tab) {
      case 'Login':
        navigation.navigate('Login');
        break;
      case 'Cart':
        navigation.navigate('Cart');
        break;
      case 'BuyerOrder': // Updated to match your file name
        navigation.navigate('BuyerOrder');
        break;
      default:
        break;
    }
  };

  // Handle FlatList onScroll to update scroll position
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    setScrollPosition(contentOffsetX);
  };

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <FlatList
        ref={carouselRef}
        data={[
          { id: '1', uri: 'https://img.freepik.com/free-photo/selection-beer-snacks-chips-fish-beer-sausages-table_99692-1152.jpg' },
          { id: '2', uri: 'https://img.freepik.com/premium-photo/stewed-cabbage-with-mushrooms-tomato-sauce_2829-10283.jpg?w=740' },
          { id: '3', uri: 'https://img.freepik.com/free-photo/top-view-delicious-burger-dark-background_140725-79568.jpg' },
        ]}
        renderItem={({ item }) => (
          <View style={[styles.carouselContent, { width: screenWidth }]}>
            <Image source={{ uri: item.uri }} style={styles.carouselImage} />
            <Text style={styles.carouselText}>CraveCurve</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
        pagingEnabled
        onScroll={handleScroll}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === item.id && styles.selectedCategory]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Image source={{ uri: item.iconUrl }} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.categoryList}
      />

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortText}>Sort by:</Text>
        <TouchableOpacity onPress={() => setSortOrder('asc')} style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Price: Low to High</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOrder('desc')} style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Price: High to Low</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={sortedProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleAddToCart(item)}
              disabled={cartAdded.includes(item.id)}
            >
              <Text style={styles.buttonText}>
                {cartAdded.includes(item.id) ? 'Added to Cart' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        contentContainerStyle={styles.productList}
      />

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress('Login')}>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress('Cart')}>
          <Text style={styles.tabText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress('BuyerOrder')}>
          <Text style={styles.tabText}>Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    paddingBottom: 80, // Ensure space for bottom tab
  },
  carouselContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  carouselText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -30 }],
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  clearButton: {
    marginLeft: 10,
  },
  clearText: {
    color: '#4caf50',
  },
  categoryList: {
    marginVertical: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
  },
  selectedCategory: {
    borderBottomWidth: 2,
    borderColor: '#4caf50',
  },
  sortContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  sortText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortButton: {
    marginLeft: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sortButtonText: {
    color: '#fff',
  },
  productList: {
    paddingTop: 10,
  },
  productCard: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
    alignItems: 'center',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  productName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 14,
    color: '#4caf50',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  bottomTabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AllProducts;
