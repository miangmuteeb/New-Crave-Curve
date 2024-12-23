import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';

const App = () => {
  // Ensure Firebase is initialized
  initializeApp();

  return <AppNavigator />;
};

export default App;
