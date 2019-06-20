const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Person = require(`${schemas}/personSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addHeader({
  name: 'Authorization',
  description: 'Authorization token',
  required: true,
  type: 'string'
});

swagger.common.parameters.addQuery({
  name: 'chatId',
  description: '',
  required: true,
  type: 'string'
});

router.delete('/remove', auth.required, async (req, res) => {
  try {
    const { id } = req.payload;
    const { chatId } = req.query;

    const myself = await Person.findById(id);
    const responder = await Person.findOne({
      chats: chatId
    });

    myself.removeChat(chatId);
    responder.removeChat(chatId);

    await myself.save();
    await responder.save();

    res.status(200).json();
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
}).describe({
  schemes: ['http', 'https'],
  security: [{ bearerAuth: [] }],
  tags: ['Chat'],
  responses: {
    200: {
      description: 'Chat successful removed'
    },
    400: {
      description: 'chatId is not exists in user chats'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['chatId']
    }
  }
});

module.exports = router;
