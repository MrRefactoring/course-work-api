const apis = require('./apis');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const swagger = require('swagger-spec-express');
const swaggerUi = require('swagger-ui-express');
const { spawn } = require('child_process');
const config = require('./config');

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || config.port || 8080;

const runDatabase = async () => {
  if (!isProd) spawn('mongod');

  await mongoose.connect(
    isProd ? config.prodDatabaseURL : config.devDatabaseURL,
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  );
};

(async () => {
  const app = express();
  const router = express.Router();

  await runDatabase();

  swagger.initialise(
    app,
    {
      title: config.title,
      version: config.version,
      produces: ['application/json']
    }
  );

  app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, authentication');
    next();
  });

  app.use('/static', express.static(path.join(__dirname, 'models')));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(config.baseUrl, apis);

  swagger.compile();

  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(swagger.json()));

  app.use(router);

  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
  });
})();
