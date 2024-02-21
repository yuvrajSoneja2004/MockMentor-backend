const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  postDesc: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: "John Doe",
  },
  userProfilePic: {
    type: String,
    default: "NOT_DEFINED",
  },
  conversation: {
    type: Array,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Feed = mongoose.model("Feed", feedSchema);

module.exports = Feed;
