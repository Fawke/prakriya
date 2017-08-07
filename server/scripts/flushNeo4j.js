const neo4jDriver = require('neo4j-driver').v1;

module.exports = function(logger, CONFIG) {
  let driver = neo4jDriver.driver(CONFIG.NEO4J.neo4jURL,
    neo4jDriver.auth.basic(CONFIG.NEO4J.usr, CONFIG.NEO4J.pwd), {encrypted: false});
  logger.debug('Neo4j Connected.');
  let query = `MATCH (n) DETACH DELETE n`;
  let session = driver.session();
  session.run(query).then(function(result, err) {
    if(err) {
      logger.error('Neo4j Error: ', err);
    } else {
      logger.debug('Neo4j Flushed.');
    }
    session.close();
    logger.debug('Neo4j Disconnected.');
  });
};
