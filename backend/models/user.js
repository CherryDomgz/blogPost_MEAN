const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },//unique - does not act as a validator, allows mongoose and mongo db to do internal optimization
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);// plugin- provided by momgoose, add an extra hook that chevks your data before it saves to the database

module.exports = mongoose.model("User", userSchema);
