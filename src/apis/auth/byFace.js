const {
  auth,
  paths: {
    modules,
    schemas
  }
} = require('../../config');

const { Image } = require('canvas');
const swagger = require('swagger-spec-express');
const Users = require(`${schemas}/personSchema`);
const faceRecognition = require(`${modules}/faceRecognition`);
const router = require('express').Router();

swagger.swaggerise(router);

swagger.common.parameters.addBody({
  name: 'Face photo from webcam',
  description: 'At the entrance is expected photo from a webcam in base64 format',
  required: true,
  schema : {
    type: 'object',
    properties: {
      photo: {
        type: 'string'
      }
    }
  }
});

router.post('/by-face', auth.optional, async (req, res) => {
  const photo = new Image();

  photo.onload = async () => {
    const prediction = await faceRecognition.findBestMatch(photo);

    if (prediction.success) {
      const user = await Users.findById(prediction.id);
      res.status(200).json(user.toAuthJSON());
    } else if (prediction.code === 400) {
      res.status(400).json({ message: 'Many faces' });
    } else if (prediction.code === 401) {
      res.status(401).json({ message: 'Unknown user' });
    } else {
      res.status(404).json({ message: 'Face recognition module disabled', error: prediction.message });
    }
  };

  photo.onerror = (e) => {
    res.status(400).json({ message: 'Invalid image', error: e });
  };

  photo.src = req.body.photo;
}).describe({
  schemes: ['http', 'https'],
  tags: ['Authorization'],
  responses: {
    200: {
      description: 'Returns JWT token'
    },
    400: {
      description: 'Many faces'
    },
    401: {
      description: 'Unknown user'
    },
    404: {
      description: 'Face recognition module disabled'
    }
  },
  common: {
    parameters: {
      body: ['Face photo from webcam']
    }
  }
});

module.exports = router;
