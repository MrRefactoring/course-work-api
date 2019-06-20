const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Chat = require(`${schemas}/chatSchema`);

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

swagger.common.parameters.addBody({
  name: 'Message',
  description: '',
  required: true,
  schema : {
    type: 'object',
    properties: {
      message: {
        type: 'string'
      }
    }
  }
});

router.post('/add-message', auth.required, async (req, res) => {
  try {
    const { id } = req.payload;
    const { chatId } = req.query;
    const { message } = req.body;

    const chat = await Chat.findById(chatId);

    chat.messages.unshift({ owner: id, message });

    await chat.save();

    res.status(200).json();
  } catch(e) {
    res.status(400).json(e);
  }
}).describe({
  schemes: ['http', 'https'],
  security: [{ bearerAuth: [] }],
  tags: ['Chat'],
  responses: {
    200: {
      description: 'Chat successfull attached to user'
    },
    400: {
      description: 'Person with transmitted id is not exists in database'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['chatId'],
      body: ['Message']
    }
  }
});

module.exports = router;
