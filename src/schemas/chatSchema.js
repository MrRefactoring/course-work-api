const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  holder: {
    type: String,
    required: [true]
  },
  respondent: {
    type: String,
    required: [true]
  },
  messages: [{
    owner: String,
    message: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
