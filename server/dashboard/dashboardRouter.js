const router = require('express').Router();
const formidable = require('formidable');
const fs = require('fs');
const mkdirp = require('mkdirp');
const logger = require('./../../applogger');
const dashboardMongoController = require('./dashboardMongoController');
const adminMongoController = require('../admin/adminMongoController.js');
const email = require('./../email');
let auth = require('../auth')();
let CONFIG = require('../../config');

/** **************************************************
*******          Notification System         ********
****************************************************/

router.post('/addnotification', auth.canAccess(CONFIG.ALL), function (req, res) {
   console.log('API HIT ==> ADD NOTIFICATION');
   try {
    dashboardMongoController.addNotification(req.body.to, req.body.message, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      res.status(500).json({error: 'Cannot add notification...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/deletenotification', auth.canAccess(CONFIG.ALL), function (req, res) {
   console.log('API HIT ==> DELETE NOTIFICATION');
   try {
    dashboardMongoController.deleteNotification(req.body.to, req.body.message, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      res.status(500).json({error: 'Cannot delete notification...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/notifications', auth.canAccess(CONFIG.ALL), function (req, res) {
  try{
    console.log('Route: : : ', req.query.username);
    dashboardMongoController.getNotifications(req.query.username, function (notifications) {
      res.status(201).json(notifications);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all notifications from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/changepassword', auth.canAccess(CONFIG.ALL), function (req, res) {
   console.log('came to change password');
   try {
    dashboardMongoController.changePassword(req.body, function (status) {
      res.status(200).json(status);
    },
    function (err) {
      res.status(500).json({error: 'Cannot change password...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update last login
router.post('/lastlogin', auth.canAccess(CONFIG.ALL), function (req, res) {
  try {
    let user = req.user;
    user.lastLogin = req.body.lastLogin;
    logger.debug('Last Login', user);
    dashboardMongoController.updateLastLogin(user, function (userObj) {
      res.status(201).json(userObj);
    }, function (err) {
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
        controls.map(function (control, key) {
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
        res.status(500).json({error: 'Cannot get all controls from db...!'});
      });
    }, function (err) {
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

// Add a new Wave
router.post('/addwave', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try {
    dashboardMongoController.addWave(req.body, function (wave) {
      res.status(200).json(wave);
    }, function (err) {
      res.status(500).json({error: 'Cannot add wave in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/wave', auth.canAccess(CONFIG.ALL), function (req, res) {
  try{
    dashboardMongoController.getWave(req.query.waveid, function (wave) {
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

router.get('/activewaves', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  try{
    dashboardMongoController.getActiveWaves(function (waves) {
      res.status(201).json(waves);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all active waves from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.post('/updatecadetwave', auth.canAccess(CONFIG.ADMIN), function (req, res) {
  try{
    dashboardMongoController.updateCadetWave(req.body.cadets, req.body.waveID, function (status) {
      res.status(201);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all active waves from db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******               Projects               ********
****************************************************/

// Get all projects
router.get('/projects', auth.canAccess(CONFIG.MENCAN), function (req, res) {
    try{
      dashboardMongoController.getProjects(function (projects) {
      res.status(201).json(projects);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all projects from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Add project
router.post('/addproject', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  try {
    let projectObj = req.body;
    projectObj.version[0].addedBy = req.user.name;
    dashboardMongoController.addProject(projectObj, function(project) {
      res.status(201).json(project);
    }, function (err) {
      console.log(err);
      res.status(500).json({error: 'Cannot add the project...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update a project
router.post('/updateproject', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  console.log(req.body.project, 'updateproj pro');
  console.log(req.user.name, 'upatwproj name');
  try {
    let projectObj = req.body.project;
    projectObj.version[req.body.version].addedBy = req.user.name;
    projectObj.version[req.body.version].updatedBy = true;
    dashboardMongoController.
    updateProject(
      projectObj,
      req.body.delList,
      req.body.prevWave,
      req.body.version,
      function (project) {
        res.status(201).json(project);
      },
      function (err) {
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
router.post('/addversion', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  try {
    let versionObj = req.body.version;
    versionObj.addedBy = req.user.name;
    versionObj.updatedBy = true;
    dashboardMongoController.addVersion(req.body.product, versionObj, function (project) {
      res.status(201).json(project);
    }, function (err) {
      res.status(500).json({error: 'Cannot update the project...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// delete a project
router.post('/deleteproject', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  try {
    if(req.body.type === 'project') {
    let projectObj = req.body.project;
    projectObj.addedBy = req.user.name;
    projectObj.updatedBy = true;
    dashboardMongoController.deleteProject(projectObj, function (project) {
      res.status(201).json(project);
    }, function (err) {
      res.status(500).json({error: 'Cannot delete the project...!'});
    });
    } else {
      dashboardMongoController.deleteVersion(req.body.project, function (project) {
        res.status(201).json(project);
      }, function (err) {
        res.status(500).json({error: 'Cannot delete the version...!'});
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get the candidate template
router.get('/candidatetemplate', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  res.send(CONFIG.CANDIDATE_TEMPLATE);
});

// Get the remarks template
router.get('/remarkstemplate', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  res.send(CONFIG.REMARKS_TEMPLATE);
});

// Get cadet profile
router.get('/cadet', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  try {
    dashboardMongoController.getCadet(req.user.email, function (cadet) {
      res.status(201).json(cadet);
    }, function (err) {
      res.status(500).json({error: 'Cannot get the cadet from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get user Role
router.get('/userrole', auth.canAccess(CONFIG.ALL), function (req, res) {
  try {
    dashboardMongoController.getUserRole(req.user.email, function (cadet) {
      res.status(201).json(cadet.role);
    }, function (err) {
      res.status(500).json({error: 'Cannot get the role from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get all the cadets
router.get('/cadets', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  try{
    dashboardMongoController.getCadets(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all cadets from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update a cadet
router.post('/updatecadet', auth.canAccess(CONFIG.ALL), function (req, res) {
  try {
    dashboardMongoController.updateCadet(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Update many cadets
router.post('/updatecadets', auth.canAccess(CONFIG.ALL), function (req, res) {
  try {
    logger.debug('Update cadets', req.body);
    dashboardMongoController.updateCadets(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidates in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Delete a cadet
router.delete('/deletecadet', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try {
    dashboardMongoController.deleteCadet(req.body, function (status) {
      res.status(200).json(status);
    }, function (err) {
      res.status(500).json({error: 'Cannot delete candidate in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all the files
router.get('/files', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.getFiles(function (files) {
      res.status(201).json(files);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all files from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Save the feedback
router.post('/savefeedback', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  try {
    dashboardMongoController.saveFeedback(req.body, function (feedback) {
      res.status(200).json(feedback);
    }, function (err) {
      res.status(500).json({error: 'Cannot save feedback in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Save the cadet evaluation
router.post('/saveevaluation', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  try {
    dashboardMongoController.saveEvaluation(req.body, function (evalObj) {
      res.status(200).json(evalObj);
    }, function (err) {
      res.status(500).json({error: 'Cannot save cadet evaluation in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


router.post('/saveimage', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    fs.readFile(files.file.path, 'binary', (readFileError, data) => {
      try {
        let buffer = new Buffer(data, 'binary');
        let cadet = JSON.parse(fields.cadet);
        let img = {};
        let dir = './public/profilePics/';
        img.data = buffer;
        img.contentType = files.file.type;
        cadet.ProfilePic = img;
        if (!fs.existsSync('./public/')) {
          logger.debug('Public Directory not present');
          mkdirp.sync('./public/');
          mkdirp(dir);
        } else if(!fs.existsSync(dir)) {
          logger.debug('ProfilePics Directory not present');
          mkdirp(dir);
        }
        let imagePath = dir + cadet.EmployeeID + '.jpeg';
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
    logger.debug('Req in getImage', req.query.eid);
    fs.readFile('public/profilePics/' + req.query.eid + '.jpeg', 'binary', (err, data) => {
      if(err) {
        res.status(500).json({error: 'No image is available...!'});
      } else {
res.send(data);
}
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******          Attendance         ********
****************************************************/

// get all candidates for specific wave
router.get('/wavespecificcandidates', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  console.log(req.query.waveID + 'in router');
  try{
    dashboardMongoController.getWaveSpecificCandidates(req.query.waveID, function (data) {
      res.status(201).json({data: data});
    }, function (err) {
      res.status(500).json({error: 'Cannot get all candidate for specific wave from db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update absentees
router.post('/updateabsentees', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  try{
    dashboardMongoController.updateAbsentees(req.body, function (status) {
      res.status(201).json({success: 'success'});
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update present
router.post('/updatepresent', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  try{
    dashboardMongoController.updatePresent(req.body.EmployeeID, new Date(), function (status) {
      res.status(201).json({success: 'success'});
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update present
router.post('/present', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.updatePresent(req.body.EmployeeID, req.body.Date, function (status) {
      dashboardMongoController.cancelLeave({id: req.body.id}, function (cancelLeaveStatus) {
        res.status(201).json({success: 'success'});
      }, function (err) {
        res.status(500).json({error: 'Cannot update candidate db...!'});
      });
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update absent
router.post('/absent', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.
    updateAbsentees({details: req.body.details, absentee: req.body.EmployeeID}, function (status) {
      dashboardMongoController.
      cancelPresent(req.body.EmployeeID, req.body.Date, function (cancelPresentStatus) {
        res.status(201).json({success: 'success'});
      }, function (err) {
        res.status(500).json({error: 'Cannot update candidate db...!'});
      });
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// cancelleave
router.post('/cancelleave', auth.canAccess(CONFIG.CANDIDATE), function (req, res) {
  try{
    dashboardMongoController.cancelLeave(req.body, function (status) {
      res.status(201).json({success: 'success'});
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update absentees
router.post('/updateapproval', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.updateApproval(req.body, function (status) {
      res.status(201).json({success: 'success'});
    }, function (err) {
      res.status(500).json({error: 'Cannot update candidate db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

router.get('/getabsentees', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.getAbsentees(function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      res.status(500).json({error: 'get absentees from db failed...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get all courses for specific wave
router.get('/coursesforwave', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  console.log(req.query.waveID + ' query param in router');
  try{
    dashboardMongoController.getCoursesForWave(req.query.waveID, function (data) {
      res.status(201).json({courses: data.CourseNames});
    }, function (err) {
      res.status(500).json({error: 'Cannot get all candidate for specific wave from db...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all candidates and tracks
router.
get('/candidatesandtracks/:waveID/:courseName', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  console.log('API HIT ===> GET Candidates And Tracks');
  try{
    dashboardMongoController.getCandidates(req.params.waveID, req.params.courseName,
       function (candidates) {
         console.log('Candidates Fetched -- ', JSON.stringify(candidates));
         dashboardMongoController.getAssesmentTrack(req.params.courseName,
           function (assessmentTrack) {
             console.log('AssessmentTrack Fetched -- ', JSON.stringify(assessmentTrack));
              res.status(201).json({
                candidates: candidates,
                assessmentTrack: assessmentTrack.AssessmentCategories
              });
           },
           function (err) {
              res.status(500).json({error: 'Cannot get the assessment track from db...!'});
           }
         );
    }, function (err) {
      res.status(500).json({error: 'Cannot get all candidates from db...!'});
    });
  } catch(err) {
    console.log('Caught: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************************
**************          Common Routes        ********
****************************************************/

// get all unique waveid
router.get('/waveids', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  console.log('API HIT ===> GET WAVEIDS');
  try{
    console.log('inside try block');
    dashboardMongoController.getWaveIDs(function (waveids) {
      console.log(waveids);
      res.status(201).json({waveids: waveids});
    }, function (err) {
      res.status(500).json({error: 'Cannot get all unique waveIDs from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get a particular wave object based on wave id
router.get('/waveobject/:waveID', auth.canAccess(CONFIG.ADMMEN), function (req, res) {
  console.log('API HIT ===> GET Wave Object');
  try{
    dashboardMongoController.getWaveObject(req.params.waveID,
       function (wave) {
         console.log('Wave Fetched: ', JSON.stringify(wave));
         res.status(201).json({waveObject: wave});
    }, function (err) {
      res.status(500).json({error: 'Cannot get wave from db...!'});
    });
  } catch(err) {
    console.log('Caught: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******          Candidates                 ********
****************************************************/

// Save the cadet information
router.post('/addcandidate', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try {
    dashboardMongoController.saveCandidate(req.body, function (evalObj) {
      res.status(200).json(evalObj);
    }, function (err) {
      res.status(500).json({error: 'Cannot save cadidate in db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/** **************************************************
*******               Email                  ********
****************************************************/

// Get all the users
router.get('/users', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    adminMongoController.getUsers(function (users) {
      console.log('users email', res);
      res.status(201).json(users);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all users from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Send a new mail
router.post('/sendmail', function (req, res) {
  logger.debug('Email request', req.body);
  email.sendEmail(req.body).then(function (result) {
    logger.debug('Email status', result.msg);
    res.send({status: result.msg});
  });
});


// Get all waves
router.get('/waves', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.getWaves(function (waves) {
      res.status(201).json(waves);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all waves from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all cadets of a particular wave
router.post('/cadetsofwave', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try{
    dashboardMongoController.getCadetsOfWave(req.body.cadets, function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all waves from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all cadets of a particular project
router.post('/cadetsofproj', auth.canAccess(CONFIG.MENTOR), function (req, res) {
  console.log('insiderouter');
  try{
    console.log('try block');
    dashboardMongoController.getCadetsOfProj(req.body.name, function (cadets) {
      res.status(201).json(cadets);
    }, function (err) {
      res.status(500).json({error: 'Cannot get all waves from db...!'});
    });
  } catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// delete a wave
router.post('/deletewave', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try {
    dashboardMongoController.deleteWave(req.body.wave, function (wave) {
      res.status(201).json(wave);
    }, function (err) {
      res.status(500).json({error: 'Cannot delete the wave...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// update a wave
router.post('/updatewave', auth.canAccess(CONFIG.ADMINISTRATOR), function (req, res) {
  try {
    dashboardMongoController.updateWave(req.body.wave, function (wave) {
      res.status(201).json(wave);
    }, function (err) {
      res.status(500).json({error: 'Cannot delete the wave...!'});
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/** **************************************************
*********          Candidate Filter         *********
****************************************************/

// Get filtered candidates
router.post('/filteredcandidates', auth.canAccess(CONFIG.ADMIN), function (req, res) {
  try{
    console.log('Filter Query 1: ', JSON.stringify(req.body.filterQuery));
    dashboardMongoController.getFilteredCandidates(req.body.filterQuery, function (candidates) {
      res.status(201).json(candidates);
    }, function (err) {
      console.log('Error: ', err);
      res.status(500).json({error: 'Cannot filter candidates from db...!'});
    });
  } catch(err) {
    console.log('Internal Error: ', err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


module.exports = router;
