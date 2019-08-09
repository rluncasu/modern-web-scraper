const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  postID: String,
  href: String,
  title: String,
  description: String,
});

module.exports = {
  postsSchema,
};
