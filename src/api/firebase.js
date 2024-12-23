import { initializeApp } from '@react-native-firebase/app';

// Ensure Firebase is initialized
const firebaseConfig = {
    apiKey: "AIzaSyAxuf00UUgiOrH-O-sRF1yJX3dMOLvhuVE",
    authDomain: "shop-nest-278.firebaseapp.com",
    projectId: "shop-nest-278",
    storageBucket: "shop-nest-278.appspot.com",
    messagingSenderId: "914929799860",
    appId: "1:914929799860:web:7d6ba6c8752a67de8cfde1",
    measurementId: "G-EV4B5G2JLD"
};

if (!initializeApp.apps.length) {
  initializeApp(firebaseConfig);
}
