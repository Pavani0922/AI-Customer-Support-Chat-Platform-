import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in .env file');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Must be "user" or "admin"' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in .env file');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    // Create user
    const user = new User({ username, password, role });
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    next(error);
  }
};



