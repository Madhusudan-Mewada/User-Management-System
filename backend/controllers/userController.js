const User = require('../models/User');
const Role = require('../models/Role');
const { body, validationResult } = require('express-validator');

const getOrCreateRole = async (roleName = 'User') => {
  let role = await Role.findOne({ name: roleName });
  if (!role) {
    role = await Role.create({ name: roleName, description: `${roleName} role` });
  }
  return role;
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.status = status;

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      query.role = roleDoc ? roleDoc._id : null;
    }

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('role', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .select('-password -refreshToken');

    const total = await User.countDocuments(query);
    const mappedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'User',
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy?.name || 'System',
      updatedBy: user.updatedBy?.name || null
    }));

    res.json({
      users: mappedUsers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Manager', 'User']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, password, role = 'User', status = 'active' } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const roleDoc = await getOrCreateRole(role);
      const userData = { name, email, password, createdBy: req.user.id, status, role: roleDoc._id };
      const user = new User(userData);
      await user.save();

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleDoc.name,
        status: user.status,
        createdAt: user.createdAt,
        createdBy: req.user.id
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

exports.updateUser = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['Admin', 'Manager', 'User']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await User.findById(id).populate('role', 'name');
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check permissions
      if (req.user.role === 'Manager' && user.role?.name === 'Admin') {
        return res.status(403).json({ message: 'Cannot update Admin users' });
      }

      if (updates.role) {
        const roleDoc = await getOrCreateRole(updates.role);
        updates.role = roleDoc._id;
      }

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) user[key] = updates[key];
      });
      user.updatedBy = req.user.id;
      await user.save();
      await user.populate('role', 'name');

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'User',
        status: user.status,
        updatedAt: user.updatedAt,
        updatedBy: user.updatedBy
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('role', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role === 'Manager' && user.role?.name === 'Admin') {
      return res.status(403).json({ message: 'Cannot delete Admin users' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted permanently' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const user = await User.findById(req.user.id).populate('role', 'name');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { name, email } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      user.updatedBy = req.user.id;
      await user.save();

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'User',
        status: user.status,
        updatedAt: user.updatedAt
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];