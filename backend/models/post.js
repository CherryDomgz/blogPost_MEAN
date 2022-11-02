const mongoose = require('mongoose');


//blueprint
const postSchema = mongoose.Schema({
  title: { type: String, required: true },//property: {type}
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // ref- to which model this id we are going to store here belongs
});

module.exports = mongoose.model('Post', postSchema); //(name of model, capital first letter, name of schema)

//String- capital S (nodejs); in the post.model.js - lowercase s (typescript)
//Collection name: plural form of Model name eg posts
