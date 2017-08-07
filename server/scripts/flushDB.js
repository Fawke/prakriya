const logger = require('./../../applogger');
const CONFIG = require('../../config');
const flushMongo = require('./flushMongo');
// const flushNeo4j = require('./flushNeo4j');
// const flushRedis = require('./flushRedis');

flushMongo(logger, CONFIG);
// flushNeo4j(logger, CONFIG);
// flushRedis();
