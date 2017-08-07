const router = require('express').Router();
const formidable = require('formidable');
const fs = require('fs');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const base64Img = require('base64-img');
const logger = require('./../../applogger');
const dashboardMongoController = require('./dashboardMongoController');
const dashboardNeo4jController = require('./dashboardNeo4jController');
const adminMongoController = require('../admin/adminMongoController.js');
const email = require('./../email');
let auth = require('../auth')();
let CONFIG = require('../../config');

/** **************************************************
*******          Notification System         ********
****************************************************/

router.post('/addnotification', auth.accessedBy(['BULK_UPLOAD', 'ATTENDANCE']), function (req, res) {
  try {
    dashboardMongoController.addNotification(req.body.to, req.body.message, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      logger.error('Add Notification Error: ', err);
      res.status(500).json({error: 'Cannot add notification...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/deletenotification', function (req, res) {
   logger.info('API HIT ==> DELETE NOTIFICATION');
   try {
    dashboardMongoController.deleteNotification(req.body.to, req.body.message, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      logger.error('Delete Notification Error: ', err);
      res.status(500).json({error: 'Cannot delete notification...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/notifications', function (req, res) {
  try{
    dashboardMongoController.getNotifications(req.query.username, function (notifications) {
      res.status(201).json(notifications);
    }, function (err) {
      logger.error('Get Notifications Error: ', err);
      res.status(500).json({error: 'Cannot get all notifications from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/changepassword', function (req, res) {
   try {
      let userObj = req.body;

      const cipher = crypto.createCipher(CONFIG.CRYPTO.ALGORITHM, CONFIG.CRYPTO.PASSWORD);
      let encrypted = cipher.update(userObj.password, 'utf8', 'hex');
      encrypted = cipher.final('hex');
      userObj.password = encrypted;

      dashboardMongoController.changePassword(userObj, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      logger.error('Change Password Error: ', err);
      res.status(500).json({error: 'Cannot change password...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update last login
router.post('/lastlogin', function (req, res) {
  try {
    let user = req.user;
    user.lastLogin = req.body.lastLogin;
    logger.debug('Last Login', user);
    dashboardMongoController.updateLastLogin(user, function (userObj) {
      res.status(201).json(userObj);
    }, function (err) {
      logger.error('Last Login Error: ', err);
      res.status(500).json({error: 'Cannot update the last login...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/user', function (req, res) {
  let userObj = {};
  try{
    dashboardMongoController.getPermissions(req.user.role, function (users) {
      adminMongoController.getAccessControls(function (controls) {
        let accesscontrols = [];
        controls.map(function (control) {
          if(users.controls.indexOf(control.code) >= 0) {
            accesscontrols.push(control.name);
          }
        });
        userObj.name = req.user.name;
        userObj.role = req.user.role;
        userObj.username = req.user.username;
        userObj.email = req.user.email;
        userObj.actions = accesscontrols;
        if(req.user.lastLogin !== undefined) {
          userObj.lastLogin = req.user.lastLogin;
        }
        res.status(201).json(userObj);
      }, function (err) {
        logger.error('Get Access Controls Error: ', err);
        res.status(500).json({error: 'Cannot get all controls from db...!'});
      });
    }, function (err) {
      logger.error('Get Controls of Role Error: ', err);
      res.status(500).json({error: 'Cannot get controls of role from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******                 Wave                 ********
****************************************************/

// Fetch all the skills
router.get('/skills', auth.accessedBy(['CANDIDATES']), function (req, res) {
    try{
      dashboardNeo4jController.getSkills(function (skills) {
      res.status(201).json(skills);
    }, function (err) {
      logger.error('Get All Skills Error: ', err);
      res.status(500).json({error: 'Cannot get all skills from neo4j...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******                 Wave                 ********
****************************************************/

// Add a new wave
router.post('/addwave', auth.accessedBy(['WAVES']), function (req, res) {
  try {
    dashboardNeo4jController.addWave(req.body, function (wave) {
      res.status(200).json(wave);
    }, function (err) {
      logger.error('Add Wave Error: ', err);
      res.status(500).json({error: 'Cannot add wave in db...!'});
    });
  } catch(err) {
    console.log(err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update a wave
router.post('/updatewave', auth.accessedBy(['WAVES']), function (req, res) {
  try {
    dashboardNeo4jController.updateWave(req.body.wave, req.body.oldCourse, function (wave) {
      res.status(201).json(wave);
    }, function (err) {
      logger.error('Update Wave Error: ', err);
      res.status(500).json({error: 'Cannot update the wave...!'});
    });
  } catch(err) {
    logger.error('Update Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Delete a wave
router.post('/deletewave', auth.accessedBy(['WAVES']), function (req, res) {
  try {
    dashboardNeo4jController.deleteWave(req.body.wave, function (status) {
      res.status(201).json(status);
    }, function (err) {
      logger.error('Delete Wave Error: ', err);
      res.status(500).json({error: 'Cannot delete the wave...!'});
    });
  } catch(err) {
    logger.error('Delete Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Fetch a wave with WaveID
router.get('/wave', function (req, res) {
  try{
    dashboardNeo4jController.getWave(req.query.waveid, req.query.course, function (wave) {
      res.status(201).json(wave);
    }, function (err) {
      logger.error('Error 1', err);
      res.status(500).json({error: 'Cannot get wave from db...!'});
    });
  } catch(err) {
    logger.error('Error 2', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Update the wave cadet's
router.post('/updatewavecadets', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardNeo4jController.updateWaveCadets(req.body.cadets, req.body.waveID, req.body.course, function (status) {
      logger.debug('Update Cadet Status: ', status);
      res.status(201).json({success:'success'});
    }, function (err) {
      logger.error('Update Cadet Wave Error: ', err);
      res.status(500).json({error: 'Cannot update cadet wave...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******               Projects               ********
****************************************************/

// Get all projects
router.get('/projects', auth.accessedBy(['PROJECTS']), function (req, res) {
    try{
      dashboardNeo4jController.getProducts(function (projects) {
      res.status(201).json(projects);
    }, function (err) {
      logger.error('Get All Projects Error: ', err);
      res.status(500).json({error: 'Cannot get all projects from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Add project
router.post('/addproject', auth.accessedBy(['PROJECTS']), function (req, res) {
  try {
    let projectObj = req.body;
    projectObj.version[0].addedBy = req.user.name;
    dashboardNeo4jController.addProduct(projectObj, function (project) {
      res.status(201).json(project);
    }, function (err) {
      logger.error('Add Project Error: ', err);
      res.status(500).json({error: 'Cannot add the project...!'});
    });
  } catch(err) {
    logger.error('Add Project Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update a project
router.post('/updateproject', auth.accessedBy(['PROJECTS']), function (req, res) {
  try {
    let version = req.body;
    version.addedBy = req.user.name;
    version.updated = true;
    dashboardNeo4jController.
    updateVersion(
      version,
      function (project) {
        res.status(201).json(project);
      },
      function (err) {
        logger.error('Update Project Error: ', err);
        res.status(500).json({error: 'Cannot update the project...!'});
      }
    );
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// add a new version
router.post('/addversion', auth.accessedBy(['PROJECTS']), function (req, res) {
  try {
    let versionObj = req.body.version;
    versionObj.addedBy = req.user.name;
    versionObj.updated = true;
    dashboardNeo4jController.addVersion(req.body.product, versionObj, function (project) {
      res.status(201).json(project);
    }, function (err) {
      logger.error('Add Version Error: ', err);
      res.status(500).json({error: 'Cannot update the project...!'});
    });
  } catch(err) {
    console.log('Add Version Internal Error: ', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// delete a project
router.post('/deleteproject', auth.accessedBy(['PROJECTS']), function (req, res) {
  try {
    if(req.body.type === 'project') {
    let productName = req.body.project.product;
    dashboardNeo4jController.deleteProduct(productName, function (project) {
      res.status(201).json(project);
    }, function (err) {
      logger.error('Delete Project Error: ', err);
      res.status(500).json({error: 'Cannot delete the project...!'});
    });
    } else {
      let versionName = req.body.project.name;
      dashboardNeo4jController.deleteVersion(versionName, function (version) {
        res.status(201).json(version);
      }, function (err) {
        logger.error('Delete Version Error: ', err);
        res.status(500).json({error: 'Cannot delete the version...!'});
      });
    }
  } catch(err) {
    logger.error('Delete Project Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get the candidate template
router.get('/candidatetemplate', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  res.send(CONFIG.CANDIDATE_TEMPLATE);
});

// Get the remarks template
router.get('/remarkstemplate', auth.accessedBy(['MENTOR_CONN']), function (req, res) {
  res.send(CONFIG.REMARKS_TEMPLATE);
});

// Get cadet profile
router.get('/cadet', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try {
    dashboardMongoController.getCadet(req.user.email, function (cadet) {
      res.status(201).json(cadet);
    }, function (err) {
      logger.error('Get Cadet: ', err);
      res.status(500).json({error: 'Cannot get the cadet from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get cadet skill
router.get('/cadetskills', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try {
    dashboardNeo4jController.getCadetSkills(req.user.email, function (cadet) {
      res.status(201).json(cadet);
    }, function (err) {
      logger.error('Get Cadet: ', err);
      res.status(500).json({error: 'Cannot get the cadet from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get cadet profile
// router.get('/cadetProfile', auth.canAccess(CONFIG.ALL), function (req, res) {
//   try {
//     dashboardNeo4jController.getCadet(req.user.email, function (cadet) {
//       res.status(201).json(cadet);
//     }, function (err) {
//       logger.error('Get Cadet: ', err);
//       res.status(500).json({error: 'Cannot get the cadet from db...!'});
//     });
//   } catch(err) {
//     res.status(500).json({
//       error: 'Internal error occurred, please report...!'
//     });
//   }
// });

// Get cadet profile
router.post('/cadetproject', auth.accessedBy(['MY_PROF']), function (req, res) {
  try {
    dashboardNeo4jController.getCadetProject(req.body.empid, function (cadet,err) {
      res.status(201).json(cadet);
    }, function (err) {
      logger.error('Get Cadet: ', err);
      res.status(500).json({error: 'Cannot get the cadet from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get user Role
router.get('/userrole', auth.accessedBy(['ATTENDANCE', 'CANDIDATES']), function (req, res) {
  try {
    dashboardMongoController.getUserRole(req.user.email, function (cadet) {
      res.status(201).json(cadet.role);
    }, function (err) {
      logger.error('Get User Role Error: ', err);
      res.status(500).json({error: 'Cannot get the role from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all the cadets
// router.get('/cadets', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
//   try{
//     dashboardNeo4jController.getCadets(function (cadets) {
//       res.status(201).json(cadets);
//     }, function (err) {
//       logger.error('Get All Cadets Error: ', err);
//       res.status(500).json({error: 'Cannot get all cadets from neo4j...!'});
//     });
//   } catch(err) {
//     logger.debug('Get cadets error', err)
//     res.status(500).json({
//       error: 'Internal error occurred, please report...!'
//     });
//   }
// });


// Get all the cadets with wave and project details
router.get('/allcadets', auth.accessedBy(['CANDIDATES']), function (req, res) {
  try{
    dashboardNeo4jController.getAllCadets(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      logger.error('Get All Cadets Error: ', err);
      res.status(500).json({error: 'Cannot get all cadets from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get cadets error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get all the cadets who are not part of any wave
router.get('/newcadets', auth.accessedBy(['MENTOR_CONN', 'WAVES']), function (req, res) {
  try{
    dashboardNeo4jController.getNewCadets(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      logger.error('Get All New Cadets Error: ', err);
      res.status(500).json({error: 'Cannot get all new cadets from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get cadets error',  err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update a cadet
router.post('/updatecadet', auth.accessedBy(['MENTOR_CONN', 'CANDIDATES', 'MY_PROF']), function (req, res) {
  try {
    dashboardNeo4jController.updateCadet(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Update Cadet Error: ', err);
      res.status(500).json({error: 'Cannot update candidate in neo4j...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update many cadets
router.post('/updatecadets', auth.accessedBy(['MENTOR_CONN']), function (req, res) {
  try {
    dashboardNeo4jController.updateCadets(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Update Cadets Error: ', err);
      res.status(500).json({error: 'Cannot update candidates in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Delete a cadet
router.delete('/deletecadet', auth.accessedBy(['CANDIDATES']), function (req, res) {
  try {
    dashboardNeo4jController.deleteCadet(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      logger.error('Delete Cadet Error: ', err);
      res.status(500).json({error: 'Cannot delete candidate in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all the files
router.get('/files', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardMongoController.getFiles(function (files) {
      res.status(201).json(files);
    }, function (err) {
      logger.error('Get All Files Error: ', err);
      res.status(500).json({error: 'Cannot get all files from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************************
***************          Feedbacks         ***********
*****************************************************/

// get all feedbacks of a particular wave
router.get('/feedbacksforwave', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardMongoController.getFeedbacks(req.query.waveID, function (feedbacks) {
      res.status(201).json(feedbacks);
    }, function (err) {
      logger.error('Get All Feedbacks Error: ', err);
      res.status(500).json({error: 'Cannot get all feedbacks from mongo...!'});
    });
  } catch(err) {
    logger.debug('Get feedbacks error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

//get candidate specific feedback
router.get('/getfeedback', auth.accessedBy(['FEEDBACK']), function(req, res) {
  try {
    dashboardMongoController.getFeedback(req.query.empID, function (feedback) {
      res.status(200).json(feedback);
    }, function (err) {
      logger.error('Get Feedback Error: ', err);
      res.status(500).json({error: 'Cannot get feedback from db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// save candidate feedback
router.post('/savefeedback', auth.accessedBy(['FEEDBACK']), function (req, res) {
  try {
    dashboardMongoController.saveFeedback(req.body, function (feedback) {
      res.status(200).json(feedback);
    }, function (err) {
      logger.error('Save Feedback Error: ', err);
      res.status(500).json({error: 'Cannot save feedback in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all the cadets with wave details
router.get('/cadetsandwave', auth.accessedBy(['EVAL_FORMS']), function (req, res) {
  try{
    dashboardNeo4jController.getCadetsAndWave(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      logger.error('Get All Cadets Error: ', err);
      res.status(500).json({error: 'Cannot get all cadets from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get cadets error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Save the cadet evaluation
router.post('/saveevaluation', auth.accessedBy(['EVAL_FORMS']), function (req, res) {
  try {
    dashboardMongoController.saveEvaluation(req.body, function (evalObj) {
      res.status(200).json(evalObj);
    }, function (err) {
      logger.error('Save Evaluation Error: ', err);
      res.status(500).json({error: 'Cannot save cadet evaluation in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

//get candidate specific evaluation
router.get('/getevaluation', auth.accessedBy(['EVAL_FORMS']), function(req, res) {
  try {
    dashboardMongoController.getEvaluation(req.query.emailID, function (evaluation) {
      res.status(200).json(evaluation);
    }, function (err) {
      logger.error('Get evaluation Error: ', err);
      res.status(500).json({error: 'Cannot get evaluation from db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

router.post('/saveimage', function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    fs.readFile(files.file.path, 'binary', (readFileError, data) => {
      try {
        let buffer = new Buffer(data, 'binary');
        let user = JSON.parse(fields.user);
        let img = {};
        let dir = './public/profilePics/';
        img.data = buffer;
        img.contentType = files.file.type;
        user.ProfilePic = img;
        if (!fs.existsSync('./public/')) {
          logger.debug('Public Directory not present');
          mkdirp.sync('./public/');
          mkdirp(dir);
        } else if(!fs.existsSync(dir)) {
          logger.debug('ProfilePics Directory not present');
          mkdirp(dir);
        }
        let imagePath = dir + (user.EmployeeID || user.username) + '.jpeg';
        logger.debug('Image Path', imagePath);
        fs.writeFile(imagePath, data, 'binary', function (writeFileError) {
            if(writeFileError) {
              throw writeFileError;
            }
        });
        res.send(data);
      } catch(err1) {
        logger.error(err1);
        res.status(500).json({
          error: 'Internal error occurred, please report...!'
        });
      }
    });
  });
});

router.get('/getimage', auth.canAccess(CONFIG.ALL), function (req, res) {
  try {
    let filename = req.query.filename;
    base64Img.base64('public/profilePics/' + filename + '.jpeg', function (err, data) {
      if(err) {
        res.status(500).json({error: 'No image is available...!'});
      } else {
        res.send(data);
      }
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});
/** **************************************************
*******          Attendance         ********
****************************************************/

// get all candidates for specific wave
router.get('/wavespecificcandidates', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try{
    dashboardNeo4jController.getCadetsOfWave(req.query.waveID, req.query.course, function (data) {
      res.status(201).json({data: data});
    }, function (err) {
      logger.error('Get Wave Specific Candidates Error: ', err);
      res.status(500).json({error: 'Cannot get all candidate for specific wave from db...!'});
    });
  } catch(err) {
    logger.error('Get Wave Specific Candidates Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// get all candidates for specific wave
router.get('/getwaveofcadet',
  auth.accessedBy(['ATTENDANCE', 'FEEDBACK','MY_PROF']),
  function (req, res) {
    try{
      dashboardNeo4jController.getWaveOfCadet(req.user.email, function (data) {
        res.status(201).json({data: data});
      }, function (err) {
        logger.error('Get Wave Specific Candidates Error: ', err);
        res.status(500).json({error: 'Cannot get all candidate for specific wave from db...!'});
      });
    } catch(err) {
      logger.error('Get Wave Specific Candidates Exception: ', err);
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);

// update absentees
router.post('/updateabsentees', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try{
    dashboardMongoController.updateAbsentees(req.body, function (status) {
      logger.info('Update Cadet Wave Status: ', status);
      res.status(201).json({success: 'success'});
    }, function (err) {
      logger.error('Update Absentees Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    logger.error('Update Absentees Error: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update present
router.post('/updatepresent', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try{
    dashboardMongoController.updatePresent(req.body.email, new Date(), function (status) {
      logger.info('Update Present Status: ', status);
      res.status(201).json({success: 'success'});
    }, function (err) {
      logger.error('Update Present Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update present
router.post('/present', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardMongoController.updatePresent(req.body.email, req.body.Date, function (status) {
      dashboardMongoController.cancelLeave({id:req.body.id}, function (cancelLeaveStatus) {
        logger.info('Update Present Status: ', status);
        logger.info('Cancel Leave Status: ', cancelLeaveStatus);
        res.status(201).json({success: 'success'});
      }, function (err) {
        logger.error('Cancel Leave Error: ', err);
        res.status(500).json({error: 'Cannot update candidate db...!'});
      });
    }, function (err) {
      logger.error('Update Present Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update absent
router.post('/absent', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardMongoController.
    updateAbsentees({details: req.body.details, absentee: req.body.email}, function (status) {
      dashboardMongoController.
      cancelPresent(req.body.email, req.body.Date, function (cancelPresentStatus) {
        logger.info('Cancel Present Status: ', cancelPresentStatus);
        logger.info('Update Absent Status: ', status);
        res.status(201).json({success: 'success'});
      }, function (err) {
        logger.error('Cancel Present Error: ', err);
        res.status(500).json({error: 'Cannot update candidate db...!'});
      });
    }, function (err) {
      logger.error('Update Absent Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// cancelleave
router.post('/cancelleave', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  try{
    dashboardMongoController.cancelLeave(req.body, function (status) {
      logger.info('Cancel Leave Status: ', status);
      res.status(201).json({success: 'success'});
    }, function (err) {
      logger.error('Cancel Leave Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update absentees
router.post('/updateapproval', auth.accessedBy(['ATTENDANCE']), function (req, res) {
  if(req.body.approval === 'closed') {
    try{
      dashboardMongoController.cancelLeave({id:{_id:req.body.id}}, function (status) {
        logger.info('Cancel Leave Status: ', status);
        res.status(201).json({success: 'success'});
      }, function (err) {
        logger.error('Cancel Leave Error: ', err);
        res.status(500).json({error: 'Cannot update candidate db...!'});
      });
    } catch(err) {
      console.log(err);
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }else {
    try{
    dashboardMongoController.updateApproval(req.body, function (status) {
      logger.info('Update Absentees Status: ', status);
      res.status(201).json({success: 'success'});
    }, function (err) {
      logger.error('Update Absentees Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    logger.error('Update Absentees Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
}
});

// update absentees
router.post('/getwavecandidates', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardMongoController.getUser(req.body.email, function (data) {
      logger.info('get user : ', data);
      res.status(201).json({data: data});
    }, function (err) {
      logger.error('Get Absentees Error: ', err);
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    logger.error('Get Absentees Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/getabsentees', auth.accessedBy(['WAVES']), function (req, res) {
  try{
    dashboardMongoController.getAbsentees(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      logger.error('Get Absentees Error: ', err);
      res.status(500).json({error: 'get absentees from db failed...!'});
    });
  } catch(err) {
    logger.error('Get Absentees Error: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all courses
router.get('/courses', auth.accessedBy(['COURSES', 'WAVES']), function(req, res) {
  try {
    dashboardNeo4jController.getCourses(function(courses) {
      res.status(201).json(courses);
    }, function(err) {
      logger.error('Get Courses For Wave Error: ', err);
      res.status(500).json({error: 'Cannot get all courses from db...!'});
    })
  } catch(err) {
    logger.error('Get Courses Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Get course for a given waveID
router.get('/courseforwave', auth.accessedBy(['WAVES', 'FEEDBACK']), function(req, res) {
  try {
    dashboardNeo4jController.getCourseForWave(req.query.waveID, req.query.course, function (course) {
      res.status(201).json(course);
    }, function (err) {
      logger.error('Get CourseForWave Error: ', err);
      res.status(500).json({error: 'Cannot get course for this wave from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get CourseForWave Error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// add courses
router.post('/addcourse', auth.accessedBy(['COURSES']), function (req, res) {
  try{
    let courseObj = req.body;
    courseObj.History = courseObj.History + ' added by ' +
     req.user.name + ' on ' + new Date() + '\n';
    dashboardNeo4jController.addCourse(courseObj, function (courses) {
      res.status(201).json(courses);
    }, function (addcourseerr) {
      logger.error('err in addcourseerr', addcourseerr);
      res.status(500).json({error: 'Cannot add course in db...!'});
    });
  } catch(err) {
    logger.error(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update courses
router.post('/updatecourse', auth.accessedBy(['COURSES']), function (req, res) {
  try{
    let courseObj = req.body.course;
    courseObj.History = courseObj.History + ' last update by ' +
     req.user.name + ' on ' + new Date() + '\n';
    dashboardNeo4jController.updateCourse(courseObj, req.body.edit, function (courses) {
      res.status(201).json(courses);
    }, function (updateerr) {
      logger.error('err in update', updateerr);
      res.status(500).json({error: 'Cannot update course in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// delete assignment or schedule
router.post('/deleteassignmentorschedule', auth.accessedBy(['COURSES']), function (req, res) {
  try{
    let obj = req.body.obj;
    console.log(req.body);
    dashboardNeo4jController.deleteAssignmentOrSchedule(obj, req.body.course, req.body.type, function (result) {
      res.status(201).json({success:'success'});
    }, function (updateerr) {
      logger.error('err in update', updateerr);
      res.status(500).json({error: 'Cannot update course in db...!'});
    });
  } catch(err) {
    console.log(err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Delete a course
router.post('/deletecourse', auth.accessedBy(['COURSES']), function (req, res) {
  try {
    let courseObj = req.body;
    courseObj.History = courseObj.History + ' deleted by ' +
     req.user.name + ' on ' + new Date() + '\n';
    dashboardNeo4jController.deleteOrRestoreCourse(courseObj, 'delete', function (status) {
      res.status(200).json(status);
    }, function (deletecourseerr) {
      logger.error('err in deletecourseerr', deletecourseerr);
      res.status(500).json({error: 'Cannot delete course in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// restore a course
router.post('/restorecourse', auth.accessedBy(['COURSES']), function (req, res) {
  try {
    let courseObj = req.body;
    courseObj.History = 'restored by ' + req.user.name + ' on ' + new Date() + '\n';
    dashboardNeo4jController.deleteOrRestoreCourse(courseObj, 'restore', function (status) {
      res.status(200).json(status);
    }, function (restorecourseerr) {
      logger.error('err in restorecourseerr', restorecourseerr);
      res.status(500).json({error: 'Cannot restore course in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get all courses for specific wave
router.get('/assessment', function (req, res) {
  try{
    console.log(req.query.waveid);
    dashboardNeo4jController.getAssessmentTrack(req.query.waveid, req.query.course, function (data) {
      res.status(201).json({data: data});
    }, function (err) {
      logger.error('Get Courses For Wave Error: ', err);
      res.status(500).json({error: 'Cannot get assessment for specific wave from db...!'});
    });
  } catch(err) {
    logger.error('Get Courses For Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// map assessments
router.post('/assessmentdetails', auth.accessedBy(['ASSG_TRACKER']), function (req, res) {
  try{
    dashboardNeo4jController.mapAssessmentTrack(req.body.assessment, req.body.update, function (data) {
      res.status(201).json({success: 'success'});
    }, function (err) {
      logger.error('Get Courses For Wave Error: ', err);
      res.status(500).json({error: 'Cannot map to assessment...!'});
    });
  } catch(err) {
    logger.error('Map assessments For Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// map assessments
router.get('/assessmentandcandidates/:waveID/:assessment/:course',
  auth.accessedBy(['ASSG_TRACKER']),
  function (req, res) {
    try{
      dashboardNeo4jController.assessmentsandcandidates(req.params.waveID, req.params.assessment, req.params.course, function (data) {
        res.status(201).json({data});
      }, function (err) {
        logger.error('Get Candidates For Wave Error: ', err);
        res.status(500).json({error: 'Cannot map to assessment...!'});
      });
    } catch(err) {
      logger.error('Get candidates For Wave Exception: ', err);
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);


// Get all candidates and tracks
// router.get('/candidatesandtracks/:waveID/:courseName',
//   auth.canAccess(CONFIG.MENTOR),
//   function (req, res) {
//     try{
//       dashboardNeo4jController.getWaveSpecificCandidates(req.params.waveID,
//          function (candidates) {
//            dashboardNeo4jController.getAssessmentTrack(req.params.courseName,
//              function (assessmentTrack) {
//                 res.status(201).json({
//                   candidates: candidates,
//                   assessmentTrack: assessmentTrack.AssessmentCategories
//                 });
//              },
//              function (err) {
//                 logger.error('Get Assessment Tracks Error: ', err);
//                 res.status(500).json({error: 'Cannot get the assessment track from db...!'});
//              }
//            );
//       }, function (err) {
//         logger.error('Get Candidates And Assessment Tracks Error: ', err);
//         res.status(500).json({error: 'Cannot get all candidates from db...!'});
//       });
//     } catch(err) {
//       logger.error('Get Candidates And Assessment Tracks Exception:', err);
//       res.status(500).json({
//         error: 'Internal error occurred, please report...!'
//       });
//     }
//   }
// );

/** **************************************************
**************          Common Routes        ********
****************************************************/

// get all unique waveid
router.get('/waveids',
  auth.accessedBy(['ASSG_TRACKER', 'ATTENDANCE', 'PROG_FLOW', 'PROJECTS']),
  function (req, res) {
    try{
      dashboardNeo4jController.getWaveIDs(function (waveids) {
        res.status(201).json({waveids: waveids});
      }, function (err) {
        logger.error('Get All Wave IDs Error: ', err);
        res.status(500).json({error: 'Cannot get all unique waveIDs from db...!'});
      });
    } catch(err) {
      logger.error('Get All Wave IDs Exception: ', err);
      res.status(500).json({
        error: 'Internal error occurred, please report...!'
      });
    }
  }
);

// Get a particular wave object based on wave id
router.get('/waveobject/:waveID/:course', function (req, res) {
  logger.info('API HIT ===> GET Wave Object');
  try{
    console.log(req.params.waveID,"req.params.WAVEID")
    dashboardNeo4jController.getSessionForWave (req.params.waveID, req.params.course,
       function (wave) {
         res.status(201).json({waveObject: wave});
    }, function (err) {
      logger.error('Get Wave Object Error: ', err);
      res.status(500).json({error: 'Cannot get wave from db...!'});
    });
  } catch(err) {
    logger.error('Get Wave Object Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************************
*******          Candidates                 ********
****************************************************/

// Save the cadet information
router.post('/addcandidate', auth.accessedBy(['CANDIDATES']), function (req, res) {
  try {
    let cadet = req.body;
      dashboardNeo4jController.addCadet(cadet, function (result) {
          logger.debug('Added the cadet', result)
              res.status(200).json(result);
          }, function(err) {
          logger.error('Error in adding a cadet in the neo4j',  err)
          res.status(500).json({error: 'Cannot save cadidate in neo4j...!'});
        })
      }
      catch(err) {
        logger.error('Add Candidate Exception: ', err);
        res.status(500).json({
          error: 'Internal error occurred, please report...!'
        });
      }
});

/** **************************************************
*******               Email                  ********
****************************************************/

// Get all the users
// router.get('/users', auth.canAccess(CONFIG.ALL), function (req, res) {
//   try{
//     adminMongoController.getUsers(function (users) {
//       res.status(201).json(users);
//     }, function (err) {
//       logger.error('Get All Users Error: ', err);
//       res.status(500).json({error: 'Cannot get all users from db...!'});
//     });
//   } catch(err) {
//     logger.error('Get All Users Exception: ', err);
//     res.status(500).json({
//       error: 'Internal error occurred, please report...!'
//     });
//   }
// });

// Send a new mail
router.post('/sendmail', auth.accessedBy(['BULK_UPLOAD']),function (req, res) {
  logger.debug('Email request', req.body);
  email.sendEmail(req.body).then(function (result) {
    logger.debug('Email status', result.msg);
    res.send({status: result.msg});
  });
});

// Get all waves
router.get('/waves', auth.accessedBy(['CANDIDATES', 'WAVES']), function (req, res) {
  try{
    dashboardNeo4jController.getWaves(function (waves) {
      res.status(201).json(waves);
    }, function (err) {
      logger.error('Get All Waves Error: ', err);
      res.status(500).json({error: 'Cannot get all waves from db...!'});
    });
  } catch(err) {
    logger.error('Get All Waves Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all cadets of a particular wave
router.post('/cadetsofwave', auth.accessedBy(['PROJECTS', 'WAVES']), function (req, res) {
  try{
    dashboardNeo4jController.getCadetsOfWave(req.body.waveid, req.body.course, function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      logger.error('Get Cadets of Wave Error: ', err);
      res.status(500).json({error: 'Cannot get all waves from db...!'});
    });
  } catch(err) {
    logger.error('Get Cadets of Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// delete a wave
router.post('/deletewave', auth.accessedBy(['WAVES']), function (req, res) {
  try {
    console.log(req.body.wave,"req.body.wave")
    dashboardNeo4jController.deleteWave(req.body.wave, function (wave) {
      res.status(201).json(wave);
    }, function (err) {
      logger.error('Delete Wave Error: ', err);
      res.status(500).json({error: 'Cannot delete the wave...!'});
    });
  } catch(err) {
    logger.error('Delete Wave Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************************
*********          Candidate Filter         *********
****************************************************/

// Get filtered candidates
router.post('/filteredcandidates', auth.accessedBy(['CANDIDATES']), function (req, res) {
  try{
    dashboardNeo4jController.getFilteredCadets(req.body.filterQuery, function (candidates) {
      res.status(201).json(candidates);
    }, function (err) {
      logger.error('Filter Candidates Error: ', err);
      res.status(500).json({error: 'Cannot filter candidates from db...!'});
    });
  } catch(err) {
    logger.error('Filter Candidates Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/billability', auth.accessedBy(['CANDIDATES']), function (req, res) {
  try{
    dashboardNeo4jController.allBillability(function (billable) {
      res.status(201).json(billable);
    }, function (err) {
      logger.error('Get All billable Error: ', err);
      res.status(500).json({error: 'Cannot get all billable count from db...!'});
    });
  } catch(err) {
    logger.error('Get All billable Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/billable', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardNeo4jController.getBillability(function (billable) {
      res.status(201).json(billable);
    }, function (err) {
      logger.error('Get All billable Error: ', err);
      res.status(500).json({error: 'Cannot get all billable count from db...!'});
    });
  } catch(err) {
    logger.error('Get All billable Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/nonbillableInternal', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardNeo4jController.getNonBillabilityInternal(function (nonbillableInternal) {
      res.status(201).json(nonbillableInternal);
    }, function (err) {
      logger.error('Get All non-billable Error: ', err);
      res.status(500).json({error: 'Cannot get all non-billable count from db...!'});
    });
  } catch(err) {
    logger.error('Get All non-billable Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});
router.get('/nonbillableCustomer', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardNeo4jController.getNonBillabilityCustomer(function (nonbillableCustomer) {
      res.status(201).json(nonbillableCustomer);
    }, function (err) {
      logger.error('Get All non-billable Error: ', err);
      res.status(500).json({error: 'Cannot get all non-billable count from db...!'});
    });
  } catch(err) {
    logger.error('Get All non-billable Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});
router.get('/free', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardNeo4jController.getBillabilityFree(function (free) {
      res.status(201).json(free);
    }, function (err) {
      logger.error('Get All billable-free Error: ', err);
      res.status(500).json({error: 'Cannot get all billable-free count from db...!'});
    });
  } catch(err) {
    logger.error('Get All billable-free Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});
router.get('/support', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
  try{
    dashboardNeo4jController.getBillabilitySupport(function (support) {
      res.status(201).json(support);
    }, function (err) {
      logger.error('Get All billable-support Error: ', err);
      res.status(500).json({error: 'Cannot get all billable-support count from db...!'});
    });
  } catch(err) {
    logger.error('Get All billable-support Exception: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});
///////////////////////program flow///////////////////
router.post('/updatesession', auth.accessedBy(['PROG_FLOW']), function (req, res) {
  try {
    dashboardNeo4jController.updateSession(req.body.wave, req.body.waveString, req.body.course, function (status) {
       console.log(req.body.waveString,"waveString")
      res.status(201).json({status:'success'});
    }, function (uperr) {
      logger.error('err in update session', uperr);
      res.status(500).json({error: 'Cannot add new session...!'});
    });
  } catch(err) {
    logger.error(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// delete session
router.post('/deletesession', auth.accessedBy(['PROG_FLOW']), function (req, res) {
  try {
    dashboardNeo4jController.deleteSession(req.body.wave,req.body.waveString ,req.body.course, function (status) {
      logger.info('Status: ', status);
      res.status(201).json(status);
    }, function (sessionerr) {
      logger.error('err in delete session', sessionerr);
      res.status(500).json({error: 'Cannot delete session...!'});
    });
  } catch(err) {
    logger.error(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

//remove cadets from wave
router.post('/removeCadetFromWave', auth.accessedBy(['WAVES']), function (req, res) {
  try {
    console.log(req.body.cadets)
    console.log(req.body.waveID)
    dashboardNeo4jController.removeCadetFromWave(req.body.cadets, req.body.waveID, req.body.course, function (status) {
      logger.info('Status: ', status);
      res.status(201).json(status);
    }, function (sessionerr) {
      logger.error('err in delete cadet in wave', sessionerr);
      res.status(500).json({error: 'Cannot delete cadet in wave...!'});
    });
  } catch(err) {
    logger.error(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/**********************************************
************ Evaluation ***********************
**********************************************/

// Get evaluation skills for a given candidateID
router.get('/evaluationfields', auth.accessedBy(['EVAL_FORMS']), function(req, res) {
  try {
    dashboardNeo4jController.getEvaluationSkills(req.query.candidateID, function (evaluationSkills) {
      res.status(201).json(evaluationSkills);
    }, function (err) {
      logger.error('Get EvaluationSkills Error: ', err);
      res.status(500).json({error: 'Cannot get evaluation skills for this candidate from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get EvaluationSkills Error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update rating for the given candidate
router.post('/updaterating', auth.accessedBy(['EVAL_FORMS']), function(req, res) {
  try {
    dashboardNeo4jController.updateRating(
      req.body.emailID,
      req.body.waveID,
      req.body.skills,
      req.body.ratings,
      function (candidate) {
      res.status(201).json(candidate);
    }, function (err) {
      logger.error('UpdateRating Error: ', err);
      res.status(500).json({error: 'Cannot update rating for this candidate in neo4j...!'});
    });
  } catch(err) {
    logger.debug('UpdateRating Error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/**********************************************
************ SkillSet *************************
**********************************************/

// Get all skills
router.get('/skillset', auth.accessedBy(['COURSES']), function(req, res) {
  try {
    dashboardNeo4jController.getSkillSet(function (skillset) {
      res.status(201).json(skillset);
    }, function (err) {
      logger.error('Get SkillSet Error: ', err);
      res.status(500).json({error: 'Cannot fetch all skills from neo4j...!'});
    });
  } catch(err) {
    logger.debug('Get SkillSet Error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Create a new skill
router.post('/createnewskill', auth.accessedBy(['COURSES']), function(req, res) {
  try {
    dashboardNeo4jController.createNewSkill(
      req.body.skill,
      function (status) {
      res.status(201).json(status);
    }, function (err) {
      logger.error('CreateNewSkill Error: ', err);
      res.status(500).json({error: 'Cannot create a new skill in neo4j...!'});
    });
  } catch(err) {
    logger.debug('CreateNewSkill Error', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

module.exports = router;
