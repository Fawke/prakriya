// const logger = require('./../applogger');
let auth = require('./auth')();
const loginRoutes = require('./login');
const dashboardRoutes = require('./dashboard');
const adminRoutes = require('./admin');
const uploadRoutes = require('./upload');
const service = require('./service');

function setupWebAppRESTRoutes(app) {
  app.use('/login', loginRoutes);
  app.use('/dashboard', auth.authenticate(), dashboardRoutes);
  app.use('/admin', auth.authenticate(), adminRoutes);
  app.use('/upload', auth.authenticate(), uploadRoutes);
  return app;
}

function welcome() {
  process.stdout.write('\n=========== Prakriya WWW ===========\n');
}

// App Constructor function is exported
module.exports = function () {
  welcome();

  let app = service.createApp();

  // app = service.setupWebpack(app);

  app = service.setupStaticRoutes(app);

  app = service.setupMiddlewares(app);

  app = setupWebAppRESTRoutes(app);

  app = service.setupRestRoutes(app);

  service.addingNeo4jConstraints();

  service.setupMongooseConnections();

  return app;
};
