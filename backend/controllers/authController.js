// Frontend Login Handler
const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
    
    try {
      const response = await axios.post('http://192.168.100.16:5000/api/login', { 
        email, 
        password 
      });
  
      // Extract token and user data
      const { token, user } = response.data;
      const { role } = user;
  
      // Store the token
      await AsyncStorage.setItem('authToken', token);
  
      // Navigate based on role
      if (role === 'manager') {
        await navigation.navigate('ManagerDashboard');
        Alert.alert('Login Successful', 'Welcome Manager!');
      } else if (role === 'customer') {
        await navigation.navigate('CustomerDashboard');
        Alert.alert('Login Successful', 'Welcome Customer!');
      } else {
        Alert.alert('Error', 'User role not recognized.');
      }
  
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Login failed. Please try again.';
      console.error('Login error:', errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Backend Authentication Controller
  const userModel = require("../models/User.js");
  const bcrypt = require("bcrypt");
  const jwt = require('jsonwebtoken');
  
  // Register function
  const register = async (req, res) => {
    try {
      const { email, password, role } = req.body;
  
      // Validate role (it must be 'customer' or 'manager')
      if (!['customer', 'manager'].includes(role)) {
        return res.status(400).json({ 
          message: "Invalid role. Role must be either 'customer' or 'manager'" 
        });
      }
  
      // Check for existing user
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password
      const hashPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser = new userModel({ email, password: hashPassword, role });
      await newUser.save();
  
      res.status(200).json({
        success: true,
        msg: "User registered successfully",
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  // Login function
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check for existing user
      const registeredUser = await userModel.findOne({ email });
      if (!registeredUser) {
        return res.status(400).json({ 
          success: false, 
          message: "User not found" 
        });
      }
  
      // Compare passwords
      const matchPassword = await bcrypt.compare(password, registeredUser.password);
      if (!matchPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid password" 
        });
      }
  
      // Create and sign JWT token
      const token = jwt.sign(
        { 
          id: registeredUser._id, 
          email: registeredUser.email, 
          role: registeredUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
      );
  
      console.log('token', token);
  
      // Set the token as a cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 72 * 60 * 60 * 1000 // 3 days
      });
  
      // Respond with success
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
          id: registeredUser._id,
          email: registeredUser.email,
          role: registeredUser.role,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Server error. Please try again later." 
      });
    }
  };
  
  // Middleware for authentication
  const authenticate = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  
  // Middleware to check user role
  const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: "Forbidden: You don't have permission to access this resource." 
        });
      }
      next();
    };
  };
  
  module.exports = { register, login, authenticate, authorizeRole };