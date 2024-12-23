import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Validation Schema for Formik
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Handle User Registration
  const handleRegister = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      // Store role in Firestore after successful registration
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email,
        role,
      });

      // Set success state to true to display success message
      setRegistrationSuccess(true);

      // Navigate to login screen after delay
      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, 2000); // Wait for 2 seconds before navigating
    } catch (error) {
      console.error(error.message);
    }
    setLoading(false);
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
          initialValues={{ email: '', password: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleRegister(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              {/* Email Input */}
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

              {/* Password Input */}
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

              {/* Confirm Password Input */}
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Role Selection (Radio Buttons) */}
              <Text style={styles.label}>Select your role:</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.radioButton, role === 'Customer' && styles.selectedRadio]}
                  onPress={() => setRole('Customer')}
                >
                  <Text style={styles.radioText}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, role === 'Restaurant' && styles.selectedRadio]}
                  onPress={() => setRole('Restaurant')}
                >
                  <Text style={styles.radioText}>Restaurant</Text>
                </TouchableOpacity>
              </View>
              {!role && <Text style={styles.errorText}>Please select a role</Text>}

              {/* Loading Indicator or Register Button */}
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              )}

              {/* Navigate to Login */}
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.loginText}>Already have an account? Login here</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        {/* Success Message */}
        {registrationSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Registration Successful, Welcome {role}!</Text>
          </View>
        )}
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
  loginText: {
    color: '#4CAF50', // Green color
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#4CAF50', // Green border for radio buttons
    borderRadius: 50,
    marginHorizontal: 10,
    backgroundColor: '#4CAF50',
  },
  selectedRadio: {
    backgroundColor: '#4CAF50', // Green background for selected radio button
  },
  radioText: {
    color: '#000', // White text color
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  successText: {
    color: '#4CAF50', // Green text
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
