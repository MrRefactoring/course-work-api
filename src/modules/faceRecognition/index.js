require('@tensorflow/tfjs-node');
const path = require('path');
const faceapi = require('face-api.js');
const config = require('../../config');
const { colors } = require('../../utils');
const { loadDescriptors, saveDescriptors } = require('./helpers');
const { Canvas, Image, ImageData } = require('canvas');

const modelsPath = path.join(config.paths.root, 'models');

let faceMatcher = null;
let facesCount = 0;

const loadModels = async () => {
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
  console.log(colors.green('Loading models...'));

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(modelsPath, 'ssd_mobilenetv1'));
  await faceapi.nets.tinyFaceDetector.loadFromDisk(path.join(modelsPath, 'tiny_face_detector'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(modelsPath, 'face_recognition'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(modelsPath, 'face_landmark_68'));
  await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(path.join(modelsPath, 'face_landmark_68_tiny'));

  console.log(colors.green('Models successfully loaded'));
};

const setFaceMatcher = async () => {
  console.log(colors.green('Loading face descriptors...'));

  const labeledDescriptors = await loadDescriptors();

  facesCount = labeledDescriptors.count;

  const labeledFaceDescriptors = await Promise.all(labeledDescriptors._labeledDescriptors.map(className => {
    const descriptors = [];

    for (let i = 0; i < className._descriptors.length; i++) {
      descriptors.push(className._descriptors[i]);
    }

    return new faceapi.LabeledFaceDescriptors(className._label, descriptors);
  }));

  console.log(colors.green('Face descriptors successfully loaded'));
  console.log(colors.green('Setting faceMatcher...'));

  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  console.log(colors.green('Face recognition module successfull loaded 🎉'));
};

const initFaceRecognition = async () => {
  try {
    await loadModels();
    await setFaceMatcher();
  } catch (e) {
    if (e.message === 'FaceRecognizer.constructor - expected atleast one input') {
      console.log(colors.green('Empty descriptors, face recognition disabled'));
      return;
    }
    console.log(colors.red(e));
    console.log(colors.red('Can not initialize face recognition module 😢'));
    process.exit(1);
  }
};

const reloadFaceMatcher = async () => {
  try {
    await setFaceMatcher();
  } catch (e) {
    if (e.message === 'FaceRecognizer.constructor - expected atleast one input') {
      console.log(colors.green('Empty descriptors, face recognition disabled'));
      return;
    }

    console.log(colors.red(e));
    console.log(colors.red('Can not reload face recognition module 😢'));
    process.exit(1);
  }
};

const findBestMatch = async (image) => {
  if (!faceMatcher) await initFaceRecognition();

  if (!faceMatcher) {
    return {
      success: false,
      message: 'Faces not defined',
      code: 404
    };
  }

  if (loadDescriptors().count !== facesCount) {
    await reloadFaceMatcher();
  }

  const faces = await faceapi
    .detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (faces.length !== 1) {
    console.log(colors.red('There are no faces or more than one face in the photo'));
    return {
      success: false,
      message: 'Many faces',
      code: 400
    };
  }

  const prediction = faceMatcher.findBestMatch(faces[0].descriptor);

  if (prediction.label === 'unknown' || prediction.distance > 0.45) {
    console.log(colors.red('Could not recognize specific user'));
    return {
      success: false,
      message: 'Unknown user',
      code: 401
    };
  }

  return {
    id: prediction.toString(false),
    success: true,
    message: 'User defined',
    code: 200
  };
};

const addFaceForRecognition = async (id, base64Photo) => {
  const photo = new Image();

  photo.onload = async () => {
    await loadModels();
    const labeledDescriptors = await loadDescriptors();

    const faces = await faceapi
      .detectAllFaces(photo)
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    if (faces.length !== 1) return;

    const faceDescriptors = labeledDescriptors._labeledDescriptors.find(className => className._label === id);

    if (!faceDescriptors) {
      labeledDescriptors._labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
        id,
        [
          faces[0].descriptor
        ]
      ));
    } else {
      faceDescriptors._descriptors.push(faces[0].descriptor);
    }

    labeledDescriptors.count += 1;

    await saveDescriptors(labeledDescriptors);
  };

  photo.onerror = (e) => {
    console.log(colors.red(e));
  };

  photo.src = base64Photo;
};

module.exports = {
  addFaceForRecognition,
  initFaceRecognition,
  findBestMatch
};
