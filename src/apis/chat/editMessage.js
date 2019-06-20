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
  name: 'Edit',
  description: '',
  required: true,
  schema : {
    type: 'object',
    properties: {
      message: {
        type: 'string'
      },
      messageId: {
        type: 'string'
      }
    }
  }
});

router.put('/edit-message', auth.required, async (req, res) => {
  try {
    const { chatId } = req.query;
    const { message, messageId } = req.body;

    const chat = await Chat.findById(chatId);

    chat.messages.find(el => el.id === messageId).message = message;

    await chat.save();

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
      description: 'Message successful edited'
    },
    400: {
      description: 'Person with transmitted id is not exists in database'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['chatId'],
      body: ['Edit']
    }
  }
});

module.exports = router;
