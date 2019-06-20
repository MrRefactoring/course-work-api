const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Person = require(`${schemas}/personSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addBody({
  name: 'user',
  description: 'Necessary parameters to create a new user',
  required: true,
  schema : {
    type: 'object',
    properties: {
      firstName: {
        type: 'string'
      },
      lastName: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    }
  }
});

router.post('/sign-up', auth.optional, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const person = new Person();

  person.firstName = firstName;
  person.lastName = lastName;
  person.email = email;
  person.setPassword(password);

  try {
    await person.save();
    res.status(200).json(person.toAuthJSON());
  } catch(e) {
    console.log(e);
    res.status(409).json(e.message);
  }
}).describe({
  schemes: ['http', 'https'],
  tags: ['Authorization'],
  responses: {
    200: {
      description: 'Creates new user and returns JWT token'
    },
    409: {
      description: 'Returns when an account with this email is already registered'
    }
  },
  common: {
    parameters: {
      body: ['user']
    }
  }
});

module.exports = router;
