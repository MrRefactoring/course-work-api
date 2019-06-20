const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Person = require(`${schemas}/personSchema`);
const Chat = require(`${schemas}/chatSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addHeader({
  name: 'Authorization',
  description: 'Authorization token',
  required: true,
  type: 'string'
});

swagger.common.parameters.addQuery({
  name: 'offset',
  description: '',
  required: false,
  type: 'number'
});

router.get('/get-chats', auth.required, async (req, res) => {
  try {
    const myself = await Person.findById(req.payload.id);
    const offset = parseInt(req.query.offset, 10) || 0;

    const chats = await Promise.all(myself.chats.map(async chatId => {
      const chat = await Chat.findById(chatId);
      const lastMessage = chat.messages[0] ? chat.messages[0].message : '';
      const respondent = await Person.findById(chat.holder === myself.id ? chat.respondent : chat.holder);

      return {
        chatId,
        lastMessage,
        offset,
        name: respondent.firstName + ' ' + respondent.lastName
      };
    }));

    res.status(200).json(chats);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
}).describe({
  schemes: ['http', 'https'],
  security: [{ bearerAuth: [] }],
  tags: ['Myself'],
  responses: {
    200: {
      description: 'Returns all myself chats'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['offset']
    }
  }
});

module.exports = router;
