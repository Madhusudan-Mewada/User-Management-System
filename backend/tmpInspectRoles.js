const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Role = require('./models/Role');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    const roles = await Role.find({}).lean();
    console.log('Roles:', JSON.stringify(roles, null, 2));
    const users = await User.find({}).limit(10).lean();
    console.log('Users sample:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
