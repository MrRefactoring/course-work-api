const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Persons = require(`${schemas}/personSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addHeader({
  name: 'Authorization',
  description: 'Authorization token',
  required: true,
  type: 'string'
});

swagger.common.parameters.addQuery({
  required: true,
  name: 'searchQuery',
  description: 'Expected first and last name',
  type: 'string'
});

router.get('/find-person', auth.required, async (req, res) => {
  try {
    const myself = await Persons.findById(req.payload.id);

    let searchResult = await Persons.findByFullname(req.query.searchQuery);

    searchResult = searchResult
      .filter(person => person.id !== myself.id && !person.blocked && !myself.chats.some((el) => person.chats.includes(el)))
      .map(person => ({
        name: person.firstName + ' ' + person.lastName,
        id: person._id
      }));

    res.status(200).json(searchResult || []);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}).describe({
  schemes: ['http', 'https'],
  security: [{ bearerAuth: [] }],
  tags: ['Search'],
  responses: {
    200: {
      description: 'Returns all available persons'
    },
    500: {
      description: 'Internal error'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['searchQuery']
    }
  }
});

module.exports = router;
