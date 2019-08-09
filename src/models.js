const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    postID: String
  });

module.exports = {
    postsSchema
}
