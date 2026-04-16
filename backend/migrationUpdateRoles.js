const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Role = require('./models/Role');

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const roles = ['Admin', 'Manager', 'User'];
    const roleMap = {};

    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({ name: roleName, description: `${roleName} role` });
        console.log(`Created role: ${roleName}`);
      }
      roleMap[roleName] = role._id;
    }

    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      let currentRoleName = 'User';

      if (user.role) {
        if (typeof user.role === 'string') {
          currentRoleName = roles.includes(user.role) ? user.role : 'User';
        } else if (user.role.name) {
          currentRoleName = roles.includes(user.role.name) ? user.role.name : 'User';
        }
      }

      const expectedRoleId = roleMap[currentRoleName];
      if (!user.role || user.role.toString() !== expectedRoleId.toString()) {
        user.role = expectedRoleId;
        await user.save();
        updatedCount += 1;
      }
    }

    console.log(`Updated ${updatedCount} users to use role references.`);

    const allUsers = await User.find({}).populate('role', 'name');
    console.log('\n=== All Users in Database ===');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role?.name || 'User'} - Status: ${user.status}`);
    });

    console.log(`\nTotal users: ${allUsers.length}`);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateRoles();
