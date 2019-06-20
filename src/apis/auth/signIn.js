const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Users = require(`${schemas}/personSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addBody({
  name: 'credentials',
  description: 'Required login parameters',
  required: true,
  schema : {
    type: 'object',
    properties: {
      email: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    }
  }
});

router.post('/sign-in', auth.optional, async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ email });

  if (user && user.validPassword(password)) {
    res.status(200).json(user.toAuthJSON());
  } else {
    res.status(401).json({ message: 'Incorrect email or password' });
  }
}).describe({
  schemes: ['http', 'https'],
  tags: ['Authorization'],
  responses: {
    200: {
      description: 'Returns JWT token'
    },
    401: {
      description: 'Incorrect email or password'
    }
  },
  common: {
    parameters: {
      body: ['credentials']
    }
  }
});

module.exports = router;
