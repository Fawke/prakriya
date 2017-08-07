const client = require('redis').createClient();

module.exports = function(logger) {
  logger.debug('Redis Connected.');
  client.flushdb( function (err, succeeded) {
    if(err) {
      logger.error('Redis Error.');
    } else if(success) {
      logger.debug('Redis Flushed.');
    }
  });
  logger.debug('Redis Disconnected.');
};
