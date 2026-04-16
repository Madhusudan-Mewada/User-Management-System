const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const generateAccessToken = (userId, roleName) => {
  return jwt.sign(
    { id: userId, role: roleName },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const getOrCreateRole = async (roleName = 'User') => {
  let role = await Role.findOne({ name: roleName });
  if (!role) {
    role = await Role.create({ name: roleName, description: `${roleName} role` });
  }
  return role;
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().notEmpty().isIn(['Admin', 'Manager', 'User']).withMessage('Role must be Admin, Manager, or User'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, password, role } = req.body;
      console.log('received role:', role);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const roleDoc = await getOrCreateRole(['Admin', 'Manager', 'User'].includes(role) ? role : 'User');
      const userData = { name, email, password, role: roleDoc._id };
      const user = new User(userData);
      await user.save();
      console.log('User saved with role:', roleDoc.name);

      const accessToken = generateAccessToken(user._id, roleDoc.name);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: roleDoc.name,
          status: user.status
        }
      });
    } catch (err) {
      if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        return res.status(400).json({ message: `${field} already exists` });
      }
      res.status(500).json({ message: err.message });
    }
  }
];

exports.login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate('role', 'name');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      const accessToken = generateAccessToken(user._id, user.role?.name || 'User');
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role?.name || 'User',
          status: user.status
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).populate('role', 'name');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role?.name || 'User');
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};
