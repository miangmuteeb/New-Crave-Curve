const express = require("express");
const routers = express.Router();
const User = require("../models/User");

const { register, login } = require("../controllers/authController");

// Routes for authentication
routers.post("/register", register);
routers.post("/login", login);




module.exports = routers;