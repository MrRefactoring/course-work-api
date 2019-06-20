const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { secret, tokenLifetime } = require('../config');

const createHash = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
};

const personSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'can\'t be empty']
  },
  lastName: {
    type: String,
    required: [true, 'can\'t beempty']
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, 'can\'t be empty'],
    match: [/\S+@\S+\.\S+/, 'email pattern is invalid'],
    unique: true,
    index: true
  },
  blocked: {
    type: Boolean,
    default: false
  },
  chats: [String],
  hash: String,
  salt: String
}, { timestamps: true });

personSchema.plugin(uniqueValidator, { message: 'is already taken' });

personSchema.statics.findByFullname = async function(fullname) {
  const [firstName, lastName] = fullname.split(' ');

  const result = await this.find({
    $or: [
      {
        firstName: { $regex: `${firstName}.*`, $options: 'i' }
      },
      {
        lastName: { $regex: `${firstName}.*`, $options: 'i' }
      },
      {
        firstName: { $regex: `${lastName}.*`, $options: 'i' }
      },
      {
        lastName: { $regex: `${lastName}.*`, $options: 'i' }
      }
    ]
  });

  return result || [];
};

personSchema.methods.addChat = function(chatId) {
  if (!this.chats.includes(chatId))
    this.chats.push(chatId);
};

personSchema.methods.removeChat = function(chatId) {
  if (this.chats.includes(chatId)) {
    const index = this.chats.indexOf(chatId);
    this.chats.splice(index, 1);
  }
};

personSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = createHash(password, this.salt);
};

personSchema.methods.validPassword = function(password) {
  const hash = createHash(password, this.salt);
  return this.hash === hash;
};

personSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);

  exp.setDate(today.getDate() + tokenLifetime);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

personSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

module.exports = mongoose.model('Person', personSchema);
