let passport = require('passport');
let passportJWT = require('passport-jwt');
let userModel = require('../../models/users.js');
let roleModel = require('../../models/roles.js');
let cfg = require('../../config');
const logger = require('./../../applogger');
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let params = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = function () {
  passport.use(new JwtStrategy(params, function (jwtPayload, done) {
    logger.debug('payload for authentication!!!');
    logger.debug(jwtPayload);
    userModel.findOne({username: jwtPayload.user}, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      }
        return done(null, false);
        // or you could create a new account
    });
  }));


  // passport.use(strategy);

  return {
    initialize: function () {
      return passport.initialize();
    },
    authenticate: function () {
      return passport.authenticate('jwt', cfg.jwtSession);
    },
    canAccess: function (allowedRoles) {
      return function (req, res, next) {
        if(allowedRoles.indexOf(req.user.role) >= 0) {
          next();
        } else {
          res.status(401).json({error: 'User is not authorized'});
        }
      };
    },
    accessedBy: function (allowedControls) {
      return function (req, res, next) {
        roleModel.findOne({name: req.user.role}, function (err, role) {
          let allowed = false;
          role.controls.map(function (code) {
            if(allowedControls.indexOf(code) >= 0) {
              allowed = true;
            }
          });

          if(allowed) {
            next();
          } else {
            res.status(401).json({error: 'User is not authorized'});
          }
        });
      };
    }
  };
};
