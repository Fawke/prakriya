const mongoose = require('mongoose');

module.exports = function(logger, CONFIG) {
  mongoose.connect(CONFIG.MONGO.mongoURL);

  mongoose.connection.on('connected', function () {
    logger.debug('Mongoose Connected.');
    mongoose.connection.db.dropDatabase();
    logger.debug('Mongoose Flushed.');
  });

  mongoose.connection.on('error', function (err) {
    logger.error('Mongoose Error: ', err);
  });

  mongoose.connection.on('disconnected', function () {
    logger.debug('Mongoose Disconnected.');
  });

  mongoose.connection.close();
};
