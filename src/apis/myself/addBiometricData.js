const { auth, paths: { modules } } = require('../../config');
const router = require('express').Router();
const swagger = require('swagger-spec-express');
const faceRecognition = require(`${modules}/faceRecognition`);

swagger.swaggerise(router);

swagger.common.parameters.addHeader({
  name: 'Authorization',
  description: 'Authorization token',
  required: true,
  type: 'string'
});

swagger.common.parameters.addBody({
  name: 'Biometric data',
  description: 'Takes photos at the entrance to add them to the recognition',
  required: true,
  schema : {
    type: 'object',
    properties: {
      photos: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  }
});

router.put('/add-biometric-data', auth.required, async (req, res) => {
  try {
    const { id } = req.payload;
    const { photos } = req.body;

    photos.forEach(photo => {
      faceRecognition.addFaceForRecognition(id, photo);
    });

    res.status(201).json();
  } catch (e) {
    res.status(400).json(e);
  }
}).describe({
  schemes: ['http', 'https'],
  security: [{ bearerAuth: [] }],
  tags: ['Myself'],
  responses: {
    201: {
      description: 'Added'
    },
    401: {
      description: 'Unauthorized'
    }
  },
  common: {
    parameters: {
      header: ['Authorization'],
      body: ['Biometric data']
    }
  }
});

module.exports = router;
