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

swagger.common.parameters.addQuery({
  name: 'chatId',
  description: '',
  required: true,
  type: 'string'
});

router.get('/get-messages', auth.required, async (req, res) => {
  try {
    const myself = await Person.findById(req.payload.id);
    const chat = await Chat.findById(req.query.chatId);
    const offset = parseInt(req.query.offset, 10) || 0;

    const messages = chat.messages
      .slice(offset, offset + 100)
      .map(el => (Object.assign({ your: el.owner === req.payload.id }, el.toObject())));
    const respondent = await Person.findById(chat.holder === myself.id ? chat.respondent : chat.holder);

    res.status(200).json({
      chatId: req.query.chatId,
      messages,
      offset,
      name: respondent.firstName + ' ' + respondent.lastName
    });
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
      query: ['offset', 'chatId']
    }
  }
});

module.exports = router;
