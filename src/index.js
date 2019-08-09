const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const tasks = require('./tasks');

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${
    process.env.MONGODB_URL
  }`,
  { useNewUrlParser: true }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('DB connected <---------------------');
  await tasks.scrapePostIds(
    'https://www.imobiliare.ro/vanzare-terenuri-constructii/bucuresti',
    1,
    66
  );
  console.log('DAN! ,<----------------------');
});
