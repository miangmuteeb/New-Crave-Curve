import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Import firestore for checking user role
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Validation Schema for Formik
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  // Handle Login
  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      const user = auth().currentUser;

      // Fetch user role from Firestore (assuming role is stored in Firestore under users collection)
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userRole = userDoc.data().role;

      // Navigate based on the role
      if (userRole === 'Restaurant') {
        navigation.navigate('SellerDashboardScreen'); // Navigate to Seller Dashboard
      } else {
        navigation.navigate('AllProducts'); // Navigate to Buyer Dashboard
      }

      Alert.alert('Login Successful', 'You are now logged in!');
    } catch (error) {
      console.error(error.message);
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  };

  // Handle Forgot Password
  const handleForgotPassword = (email) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Password Reset', 'Password reset email sent successfully.');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' }} // Logo URL
        style={styles.logo}
      />
      <ScrollView>
        <Text style={styles.restaurantName}>Crave Curve</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleLogin(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {loading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              )}

              {/* Forgot Password */}
              <TouchableOpacity onPress={() => handleForgotPassword(values.email)}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.registerText}>Don't have an account? Register here</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for brand name
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#4CAF50', // Green border for inputs
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f1f1f1', // Light grey background for inputs
    color: '#333', // Dark text color for inputs
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff', // White text on the button
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#4CAF50', // Green color for forgot password link
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  registerText: {
    color: '#4CAF50', // Green color for register link
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
});

export default LoginScreen;
