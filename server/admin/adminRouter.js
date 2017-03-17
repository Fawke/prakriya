const router = require('express').Router();
const users = require('../../models/users.js');
// const passport = require('passport');
var auth = require('../auth')();
const adminMongoController = require('./adminMongoController');

// Get all the users
router.get("/users", auth.authenticate(), function(req, res) {

  console.log("API HIT!!!");  
  try{
    adminMongoController.getUsers(function(users) {
      res.status(201).json(users);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all users from db...!' });
    });
  }
  catch(err){
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    }); 
  }
});

//Add a new user
router.post('/adduser', auth.authenticate(), function(req, res) {
    let user = req.body
    user.username = user.email.split('@')[0]
    adminMongoController.addUser(user)
      .then(function(savedUser) {
        res.send(user)
      })
  }
)

// Get all the roles
router.get('/roles', auth.authenticate(), function (req, res) {
  try{
    adminMongoController.getRoles(function(roles) {
      res.status(201).json(roles);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all roles from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    }); 
  }

})

module.exports = router;

