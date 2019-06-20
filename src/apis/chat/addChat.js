const { auth, paths: { schemas } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const Persons = require(`${schemas}/personSchema`);
const Chat = require(`${schemas}/chatSchema`);

swagger.swaggerise(router);

swagger.common.parameters.addHeader({
  name: 'Authorization',
  description: 'Authorization token',
  required: true,
  type: 'string'
});

swagger.common.parameters.addQuery({
  name: 'personId',
  description: '',
  required: true,
  type: 'string'
});

router.put('/add', auth.required, async (req, res) => {
  try {
    const { id } = req.payload;
    const { personId } = req.query;

    const myself = await Persons.findById(id);
    const respondent = await Persons.findById(personId);

    if (!respondent) {
      throw new Error('Person not found');
    } else if (myself.chats.some((el) => respondent.chats.includes(el))) {
      res.status(409).json();
      return;
    }

    const chat = new Chat();

    chat.holder = id;
    chat.respondent = personId;

    await chat.save();

    const chatId = (await Chat.findOne({ holder: id, respondent: personId })).id;

    myself.addChat(chatId);
    respondent.addChat(chatId);

    await myself.save();
    await respondent.save();

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
      description: 'Chat successfull attached to user'
    },
    400: {
      description: 'Person with transmitted id is not exists in database'
    },
    409: {
      description: 'Chat already exists'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      query: ['personId']
    }
  }
});

module.exports = router;
