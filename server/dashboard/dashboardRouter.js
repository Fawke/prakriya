const router = require('express').Router();
const formidable = require('formidable');
const fs = require('fs');
const logger = require('log4js').getLogger();
var auth = require('../auth')();
const dashboardMongoController = require('./dashboardMongoController');
const adminMongoController = require('../admin/adminMongoController.js');
const email = require('./../email');
var auth = require('../auth')();
var CONFIG = require('../../config');

router.post('/changepassword', function(req, res) {
  try {
    dashboardMongoController.changePassword(req.user, function(status) {
      res.status(200).json(status);
    },
    function(err) {
      res.status(500).json({ error: 'Cannot change password...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

router.get("/user", function(req, res) {
  // res.json(users[req.user.id]);
  console.log("req from user!!!")
  console.log('User object sent ', req.user);
  let userObj = {};
  try{
    dashboardMongoController.getPermissions(req.user.role, function(users) {
      // userObj.actions = req.user.actions.filter(function(action) {
      //   return action != "Login";
      // });
      adminMongoController.getAccessControls(function(controls) {
        let accesscontrols = [];
        controls.map(function (control, key) {
          if(users.controls.indexOf(control.code) >= 0)
            accesscontrols.push(control.name)
        })
        userObj.name = req.user.name;
        userObj.role = req.user.role;
        userObj.username = req.user.username;
        userObj.email = req.user.email;
        userObj.actions = accesscontrols;
        res.status(201).json(userObj);
      }, function(err) {
        res.status(500).json({ error: 'Cannot get all controls from db...!' });
      })
    }, function(err) {
      res.status(500).json({ error: 'Cannot get controls of role from db...!' });
    });
  }
  catch(err){
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Add a new Wave
router.post('/addwave', auth.canAccess(CONFIG.ADMINISTRATOR), function(req, res) {
  try {
    dashboardMongoController.addWave(req.body, function (wave) {
      res.status(200).json(wave)
    }, function (err) {
      res.status(500).json({ error: 'Cannot add wave in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Get all projects
router.get('/projects', auth.canAccess(CONFIG.MENCAN), function(req, res) {
  try{
    dashboardMongoController.getProjects(function(projects) {
      res.status(201).json(projects);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all projects from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

//Add project
router.post('/addproject', auth.canAccess(CONFIG.MENTOR), function(req, res) {
  try {
    let projectObj = req.body;
    projectObj.addedBy = req.user.name;
    dashboardMongoController.addProject(projectObj, function(project) {
      res.status(201).json(project);
    }, function (err) {
      res.status(500).json({ error: 'Cannot add the project...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

//update a project
router.post('/updateproject', auth.canAccess(CONFIG.MENTOR), function(req, res) {
  try {
    let projectObj = req.body;
    projectObj.addedBy = req.user.name;
    projectObj.updatedBy = true;
    dashboardMongoController.updateProject(projectObj, function(project) {
      res.status(201).json(project);
    }, function (err) {
      res.status(500).json({ error: 'Cannot update the project...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

//update a project
router.post('/deleteproject', auth.canAccess(CONFIG.MENTOR), function(req, res) {
  try {
    let projectObj = req.body;
    projectObj.addedBy = req.user.name;
    projectObj.updatedBy = true;
    dashboardMongoController.deleteProject(projectObj, function(project) {
      res.status(201).json(project);
    }, function (err) {
      res.status(500).json({ error: 'Cannot update the project...!' });
    })
  }
  catch(err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Get cadet profile
router.get('/cadet', auth.canAccess(CONFIG.CANDIDATE), function(req, res) {
  try {
    dashboardMongoController.getCadet(req.user.email, function(cadet) {
      res.status(201).json(cadet);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get the cadet from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Get all the cadets
router.get('/cadets', auth.canAccess(CONFIG.ADMMEN), function(req, res) {
  try{
    dashboardMongoController.getCadets(function(cadets) {
      res.status(201).json(cadets);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all cadets from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Update a cadet
router.post('/updatecadet', auth.canAccess(CONFIG.ALL), function(req, res) {
  try {
    dashboardMongoController.updateCadet(req.body, function (status) {
      res.status(200).json(status)
    }, function (err) {
      res.status(500).json({ error: 'Cannot update candidate in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Delete a cadet
router.delete('/deletecadet', auth.canAccess(CONFIG.ADMINISTRATOR), function(req, res) {
  console.log('reached to server');
  try {
    dashboardMongoController.deleteCadet(req.body, function (status) {
      res.status(200).json(status)
    }, function (err) {
      res.status(500).json({ error: 'Cannot delete candidate in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Get all the files
router.get('/files', auth.canAccess(CONFIG.ADMINISTRATOR), function(req, res) {
  try{
    dashboardMongoController.getFiles(function(files) {
      res.status(201).json(files);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all files from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Save the feedback
router.post('/savefeedback', auth.canAccess(CONFIG.CANDIDATE), function(req, res) {
  try {
    dashboardMongoController.saveFeedback(req.body, function (feedback) {
      res.status(200).json(feedback)
    }, function (err) {
      res.status(500).json({ error: 'Cannot save feedback in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Save the cadet evaluation
router.post('/saveevaluation', auth.canAccess(CONFIG.MENTOR), function(req, res) {
  try {
    dashboardMongoController.saveEvaluation(req.body, function (eval) {
      res.status(200).json(eval)
    }, function (err) {
      res.status(500).json({ error: 'Cannot save cadet evaluation in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})


router.post('/saveimage', auth.canAccess(CONFIG.CANDIDATE), function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    fs.readFile(files.file.path, 'binary', (err, data) => {
      try {
        let buffer = new Buffer(data, 'binary')
        let cadet = JSON.parse(fields.cadet);
        let img = {};
        img.data = buffer;
        img.contentType = files.file.type;
        cadet.ProfilePic = img;
        let imagePath = 'public/profilePics/' + cadet.EmployeeID + '.jpeg'
        fs.writeFile(imagePath, data, 'binary', function(err){
            if (err) throw err
            console.log('File saved.')
        })
        res.send(data);
      }
      catch(err) {
        res.status(500).json({
          error: 'Internal error occurred, please report...!'
        });
      }
    });
  })
})

router.get('/getimage', auth.canAccess(CONFIG.CANDIDATE), function(req, res) {
  try {
    dashboardMongoController.getCadet(req.user.email, function(cadet) {
      fs.readFile('public/profilePics/' + cadet.EmployeeID + '.jpeg', 'binary', (err, data) => {
        res.send(data);
      });
    }, function(err) {
      res.status(500).json({ error: 'Cannot get the cadet from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})


/****************************************************
*******          Attendance         ********
****************************************************/

//get all candidates for specific wave
router.get("/wavespecificcandidates", auth.canAccess(CONFIG.ADMMEN), function(req, res) {
  console.log(req.query.waveID+'in router');
  try{
    dashboardMongoController.getWaveSpecificCandidates(req.query.waveID,function(data) {
      res.status(201).json({data:data});
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all candidate for specific wave from db...!' });
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

//update absentees
router.post("/updateabsentees", auth.canAccess(CONFIG.ADMINISTRATOR), function(req, res) {

  try{
    dashboardMongoController.updateAbsentees(req.body,function(status) {
      res.status(201);
    }, function(err) {
      res.status(500).json({ error: 'Cannot update candidate db...!' });
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


// Get all courses for specific wave
router.get('/coursesforwave', auth.canAccess(CONFIG.ADMMEN), function(req, res) {
  console.log(req.query.waveID + ' query param in router');
  try{
    dashboardMongoController.getCoursesForWave(req.query.waveID, function(data) {
      res.status(201).json({courses: data.CourseNames});
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all candidate for specific wave from db...!' });
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get all candidates and tracks
router.get("/candidatesandtracks/:waveID/:courseName", auth.canAccess(CONFIG.MENTOR), function(req, res) {

  console.log("API HIT ===> GET Candidates And Tracks");
  try{
    dashboardMongoController.getCandidates(req.params.waveID, req.params.courseName,
       function(candidates) {
         console.log('Candidates Fetched: ', JSON.stringify(candidates))
         dashboardMongoController.getAssesmentTrack(req.params.waveID, req.params.courseName,
           function(assessmentTrack) {
             console.log('AssessmentTrack Fetched: ', JSON.stringify(assessmentTrack))
              res.status(201).json({
                candidates: candidates,
                assessmentTrack: assessmentTrack
              });
           },
           function(err) {
              res.status(500).json({ error: 'Cannot get the assessment track from db...!'});
           }
         )
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all candidates from db...!'});
    });
  }
  catch(err){
    console.log('Caught: ', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

/****************************************************
**************          Common Routes        ********
****************************************************/

//get all unique waveid
router.get("/waveids", auth.canAccess(CONFIG.ADMMEN), function(req, res) {

  console.log("API HIT ===> GET WAVEIDS");
  try{
    console.log("inside try block")
    dashboardMongoController.getWaveIDs(function(waveids) {
      console.log(waveids)
      res.status(201).json({waveids: waveids});
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all unique waveIDs from db...!' });
    });
  }
  catch(err){
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});

// Get a particular wave object based on wave id
router.get("/waveobject/:waveID", auth.canAccess(CONFIG.ADMMEN), function(req, res) {

  console.log("API HIT ===> GET Wave Object");
  try{
    dashboardMongoController.getWaveObject(req.params.waveID,
       function(wave) {
         console.log('Wave Fetched: ', JSON.stringify(wave))
         res.status(201).json({waveObject: wave})
    }, function(err) {
      res.status(500).json({ error: 'Cannot get wave from db...!'});
    });
  }
  catch(err){
    console.log('Caught: ', err)
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
});


/****************************************************
*******          Candidates                 ********
****************************************************/

// Save the cadet information
router.post('/addcandidate', auth.canAccess(CONFIG.ADMINISTRATOR), function(req, res) {
  try {
    dashboardMongoController.saveCandidate(req.body, function (eval) {
      res.status(200).json(eval)
    }, function (err) {
      res.status(500).json({ error: 'Cannot save cadidate in db...!' });
    })
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})


/****************************************************
*******               Email                  ********
****************************************************/

// Get all the users
router.get('/users', auth.canAccess(CONFIG.ADMINISTRATOR), function(re,req) {
  try{
    adminMongoController.getUsers(function(users) {
      res.status(201).json(users);
    }, function(err) {
      res.status(500).json({ error: 'Cannot get all users from db...!' });
    });
  }
  catch(err) {
    res.status(500).json({
      error: 'Internal error occurred, please report...!'
    });
  }
})

// Send a new mail
router.post('/sendmail', function(req, res) {
  logger.debug('Email request', req.body)
  email.sendEmail(req.body).then(function(result) {
    logger.debug('Email status', result.msg);
  });
})
module.exports = router;
