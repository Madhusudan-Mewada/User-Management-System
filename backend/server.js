const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes [cite: 102]
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // await User.syncIndexes();
    app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
  })
  .catch(err => console.log(err));