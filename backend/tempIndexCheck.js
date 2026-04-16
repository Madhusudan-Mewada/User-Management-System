const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const coll = (await mongoose.connection.db.listCollections({ name: 'users' }).toArray())[0];
    if (!coll) {
      console.log('users collection missing');
    } else {
      const indexes = await mongoose.connection.db.collection('users').indexes();
      console.log(JSON.stringify(indexes, null, 2));
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
