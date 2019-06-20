const jwt = require('express-jwt');
const { secret } = require('../config');

const getTokenFromHeaders = (req) => {
  const { authorization } = req.headers;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }

  return null;
};

const passport = {
  required: jwt({
    secret,
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),

  optional: jwt({
    secret,
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = passport;

