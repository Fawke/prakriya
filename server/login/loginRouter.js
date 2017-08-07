const router = require('express').Router();
const crypto = require('crypto');
const userModel = require('../../models/users.js');
let jwt = require('jwt-simple');
let cfg = require('../../config');
const logger = require('./../../applogger');

// encoding tokens here!!!!!
router.post('/', function (req, res) {
    if (req.body.username && req.body.password) {

      const cipher = crypto.createCipher(cfg.CRYPTO.ALGORITHM, cfg.CRYPTO.PASSWORD);
      let encrypted = cipher.update(req.body.password, 'utf8', 'hex');
      encrypted = cipher.final('hex');
      
      let uname = req.body.username;
      let password = encrypted;
      let query = userModel.findOne({username: uname, password: password});
      let promise = query.exec();

      promise.then(function (user) {
        logger.debug('User object in the loginRouter', user);
        if (user) {
          if(user.role !== 'admin' && user.actions.indexOf('login') <= -1) {
            res.send('Account suspended');
          } else {
            let payload = {
                id: user._id,
                user: user.username
            };
            logger.debug(payload);
            let token = jwt.encode(payload, cfg.jwtSecret);
    // expiresIn: 10080 // in seconds});
            logger.debug(token);
            res.json({
                // user: user,
                token: 'JWT ' + token
            });
          }
        } else {
            res.sendStatus(401);
        }
      });
    } else {
        res.sendStatus(401);
    }
});

module.exports = router;
