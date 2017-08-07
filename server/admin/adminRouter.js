const router = require('express').Router();
const crypto = require('crypto');
const adminMongoController = require('./adminMongoController');
let auth = require('../auth')();
let CONFIG = require('../../config');
const logger = require('./../../applogger');

/** **************************************
*******          Users           ********
****************************************/

// Get all the users
router.get('/users', function (req, res) {
  try{
    adminMongoController.getUsers(function (userColl) {

      userColl.map(function (user, index) {
        logger.debug('Password of the user', user.password)
        const decipher = crypto.createDecipher(CONFIG.CRYPTO.ALGORITHM, CONFIG.CRYPTO.PASSWORD);
        let decrypted = decipher.update(user.password, 'hex', 'utf8');
        decrypted = decipher.final('utf8');
        user.password = decrypted;

        if(index == userColl.length-1) {
          res.status(201).json(userColl);
        }
      })

    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot get all users from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Add a new user
router.post('/adduser', auth.accessedBy(['USERS']), function (req, res) {
  let userObj = req.body;
  try{
    console.log(req.body)
    adminMongoController.addUser(req.body, function (user) {
      res.status(200).json(user);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot add user in db...!'});
    });
  } catch(err) {
    logger.error('Error in adding a user', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.delete('/deleteuser', auth.accessedBy(['USERS']), function (req, res) {
  console.log('DELETEUSER: ', req.body)
  try {
    adminMongoController.deleteUser(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot delete user in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/updateuser', auth.accessedBy(['USERS']), function (req, res) {
  let userObj = req.body;
  try{
    const cipher = crypto.createCipher(CONFIG.CRYPTO.ALGORITHM, CONFIG.CRYPTO.PASSWORD);
    let encrypted = cipher.update(userObj.password, 'utf8', 'hex');
    encrypted = cipher.final('hex');

    userObj.password = encrypted;

    adminMongoController.updateUser(userObj, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot update user in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/lockuser', auth.accessedBy(['USERS']), function (req, res) {
  try {
    adminMongoController.lockUser(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot lock user account in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/unlockuser', auth.accessedBy(['USERS']), function (req, res) {
  try {
    adminMongoController.unlockUser(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot unlock user account in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************
*******          Roles           ********
****************************************/

// Get all the roles
router.get('/roles', auth.accessedBy(['ROLES']), function (req, res) {
  try{
    adminMongoController.getRoles(function (roles) {
      res.status(201).json(roles);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot get all roles from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Add a new role
router.post('/addrole', auth.accessedBy(['ROLES']), function (req, res) {
    try {
      adminMongoController.addRole(req.body, function (role) {
        res.status(200).json(role);
      }, function (err) {
        logger.error('Error', err);
        res.status(500).json({error: 'Cannot add role in db...!'});
      });
    } catch(err) {
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);

// Update role
router.post('/updaterole', auth.accessedBy(['ROLES']), function (req, res) {
    try {
      adminMongoController.updateRole(req.body, function (status) {
        res.status(200).json(status);
      }, function (err) {
        logger.error('Error', err);
        res.status(500).json({error: 'Cannot update role in db...!'});
      });
    } catch(err) {
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);

// Delete a role
router.delete('/deleterole', auth.accessedBy(['ROLES']), function (req, res) {
    try {
      adminMongoController.deleteRole(req.body, function (status) {
        res.status(200).json(status);
      }, function (err) {
        logger.error('Error', err);
        res.status(500).json({error: 'Cannot delete role in db...!'});
      });
    } catch(err) {
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);

/** **************************************
********       Controls        **********
****************************************/

// Get all the access controls
router.get('/accesscontrols', auth.accessedBy(['ROLES']), function (req, res) {
  try{
    adminMongoController.getAccessControls(function (controls) {
      res.status(201).json(controls);
    }, function (err) {
      logger.error('Error', err);
      res.status(500).json({error: 'Cannot get all access controls from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

module.exports = router;
