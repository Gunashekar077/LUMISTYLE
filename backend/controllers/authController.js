import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, getUserById, users, updateUserPassword } from '../config/dataStore.js';


// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lumistylesecretkey9876543210', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  try {
    const userExists = getUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (e.g. admin if email contains admin@lumistyle.com or has a query parameter for dev/seed purposes)
    let role = 'user';
    if (email.toLowerCase().endsWith('@lumistyle.admin') || email.toLowerCase() === 'admin@lumistyle.com') {
      role = 'admin';
    }

    const user = await createUser({ name, email, password, role });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Please enter both email and password.' });
  }

  try {
    const rawUser = getUserByEmail(email);

    if (!rawUser) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const isMatch = await bcrypt.compare(password, rawUser.password);
    if (isMatch) {
      res.json({
        _id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        token: generateToken(rawUser.id),
      });
    } else {
      res.status(401).json({ message: 'Email or password is incorrect.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  // req.user was attached by protect middleware
  if (req.user) {
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const resetCodes = new Map(); // email -> { code, expires }

// @desc    Request password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide email' });
  }

  try {
    const user = getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory map with 10 minutes expiry
    resetCodes.set(email.toLowerCase(), {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`Password reset requested for ${email}. Development Code: ${code}`);

    res.json({
      message: 'Verification code generated.',
      devCode: code // Return code in response for local development testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
};

// @desc    Reset password using code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, verification code, and new password' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const record = resetCodes.get(email.toLowerCase());

    if (!record) {
      return res.status(400).json({ message: 'No reset code requested for this email' });
    }

    if (record.expires < Date.now()) {
      resetCodes.delete(email.toLowerCase());
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Update password
    const success = await updateUserPassword(email, newPassword);

    if (success) {
      // Clear code
      resetCodes.delete(email.toLowerCase());
      res.json({ message: 'Password reset successful. You can now log in.' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

