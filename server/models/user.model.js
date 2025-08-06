const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, required: true },
    avatar_url: { type: String },
    html_url: { type: String },
    email: { type: String },
    bio: { type: String },
    access_token: { type: String }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = User
