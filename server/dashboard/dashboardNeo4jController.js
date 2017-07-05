const neo4jDriver = require('neo4j-driver').v1;
const logger = require('./../../applogger');
const config = require('./../../config');
const graphConsts = require('./../common/graphConstants');

let driver = neo4jDriver.driver(config.NEO4J.neo4jURL,
  neo4jDriver.auth.basic(config.NEO4J.usr, config.NEO4J.pwd), {encrypted: false});

/**********************************************
************ Candidate management *************
**********************************************/

// Add cadet

let addCadet = function(cadetObj, successCB, errorCB) {

  let cadet = {};

  cadet.EmployeeID = cadetObj.EmployeeID || '';
  cadet.EmployeeName = cadetObj.EmployeeName || '';
  cadet.EmailID = cadetObj.EmailID || '';
  cadet.AltEmail = cadetObj.AltEmail || '';
  cadet.Contact = cadetObj.Contact || '';
  cadet.DigiThonQualified = cadetObj.DigiThonQualified || '';
  cadet.DigiThonPhase = cadetObj.DigiThonPhase || '';
  cadet.DigiThonScore = cadetObj.DigiThonScore || '';
  cadet.CareerBand = cadetObj.CareerBand || '';
  cadet.WorkExperience = cadetObj.WorkExperience || '';
  cadet.Billability = cadetObj.Billability || '';
  cadet.PrimarySupervisor = cadetObj.PrimarySupervisor || '';
  cadet.ProjectSupervisor = cadetObj.ProjectSupervisor || '';
  cadet.Selected = cadetObj.Selected || '';
  cadet.Remarks = cadetObj.Remarks || '';

  let session = driver.session();

  let query  =
  	`CREATE (n: ${graphConsts.NODE_CANDIDATE}
  	{
  		EmployeeID: '${cadet.EmployeeID}',
  		EmployeeName: '${cadet.EmployeeName}',
  		EmailID: '${cadet.EmailID}',
  		AltEmail: '${cadet.AltEmail}',
  		Contact: '${cadet.Contact}',
  		DigiThonQualified: '${cadet.DigiThonQualified}',
  		DigiThonPhase: '${cadet.DigiThonPhase}',
  		DigiThonScore: '${cadet.DigiThonScore}',
  		CareerBand: '${cadet.CareerBand}',
  		WorkExperience: '${cadet.WorkExperience}',
      Billability: '${cadet.Billability}',
  		PrimarySupervisor: '${cadet.PrimarySupervisor}',
  		ProjectSupervisor: '${cadet.ProjectSupervisor}',
  		Selected: '${cadet.Selected}',
  		Remarks: '${cadet.Remarks}'
  	}) return n`;

  session.run(query)
    .then(function(result) {
      logger.debug('Result from the neo4j', result)

      // Completed!
      session.close();
      successCB(cadetObj);
    })
    .catch(function(err) {
      errorCB(err);
    });
}

// Get all the cadets

let getCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query  = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) return n`;
  session.run(query)
    .then(function(resultObj) {
      session.close();
      let cadets = [];
      for(let i = 0; i < resultObj.records.length; i++) {
        let result = resultObj.records[i];
        logger.debug('Result obj from neo4j', result._fields);
          cadets.push(result._fields[0].properties);
      }
      successCB(cadets);
    })
    .catch(function (err) {
      errorCB(err);
    })
}

// Get all the new cadets

let getNewCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query  = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) return n`;
  session.run(query)
    .then(function(resultObj) {
      session.close();
      let cadets = [];

      for(let i = 0; i < resultObj.records.length; i++) {
        let result = resultObj.records[i];
        logger.debug('Result obj from neo4j', result._fields);
          cadets.push(result._fields[0].properties);
      }
      successCB(cadets);
    })
    .catch(function (err) {
      errorCB(err);
    })
}


/**********************************************
************** Course management **************
**********************************************/

let addCourse = function (CourseObj, successCB, errorCB) {
  logger.info(CourseObj);
  let query = `MERGE (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}',Name:'${CourseObj.Name}',
  Mode:'${CourseObj.Mode}',Duration:${CourseObj.Duration},History:'${CourseObj.History}',
  Removed:${CourseObj.Removed}}) WITH c AS course
  UNWIND ${JSON.stringify(CourseObj.Skills)} AS skill
  MERGE (n:${graphConsts.NODE_SKILL}{Name:skill})
  MERGE (n)<-[:${graphConsts.REL_INCLUDES}]-(course);`;
    let session = driver.session();
       session.run(query).then(function (resultObj, err) {
           session.close();
           if(resultObj) {
           logger.debug(resultObj);
            successCB();
         } else {
             errorCB(err);
           }
         });
  };

let getCourses = function (successCB, errorCB) {
  let query = `MATCH (courses:${graphConsts.NODE_COURSE})
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_INCLUDES}]->(s:${graphConsts.NODE_SKILL})
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_HAS}]->(a:${graphConsts.NODE_ASSIGNMENT})-[:${graphConsts.REL_INCLUDES}]->(aSkill:${graphConsts.NODE_SKILL})
  with collect(aSkill.Name) as assgSkill, a as a, courses as courses,s as s
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_HAS}]->(se:${graphConsts.NODE_SESSION})
  optional match (se)-[:${graphConsts.REL_INCLUDES}]->(seSkill:${graphConsts.NODE_SKILL})
  with collect(seSkill.Name) as sessSkill, assgSkill as assgSkill, a as a, courses as courses,s as s,se as se
  return courses, collect(distinct s.Name) as skills,COLLECT(distinct {a: a, b: assgSkill}) as assg,COLLECT(distinct {a: se, b: sessSkill}) as session`;
    let session = driver.session();
       session.run(query).then(function (resultObj, err) {
           session.close();
           let courseArray = [];
           for(let i = 0; i < resultObj.records.length; i++) {
                let result = resultObj.records[i];
                console.log(result);
                courseArray.push(result._fields[0].properties);
                courseArray[i].Skills = result._fields[1];
                if(result._fields[2][0].a === null) {
                  courseArray[i].Assignments = [];
                }
                else {
                  console.log(result._fields[2][0].a.properties);
                  let Assignments = [];
                  for(let j=0; j< result._fields[2].length; j++) {
                    Assignments.push(result._fields[2][j].a.properties);
                    Assignments[j].Skills = result._fields[2][j].b;
                  }
                  courseArray[i].Assignments = Assignments
                }
                if(result._fields[3][0].a === null) {
                  courseArray[i].Schedule = [];
                }
                else {
                  let Session = [];
                  for(let j=0; j< result._fields[3].length; j++) {
                    console.log(result._fields[3][j].b);
                    Session.push(result._fields[3][j].a.properties);
                    Session[j].Skills = result._fields[3][j].b;
                  }
                  courseArray[i].Schedule = Session
                }
            }
         if(err) {
           errorCB('Error');
         } else {
           logger.debug(courseArray);
           successCB(courseArray);
          }
         });
};

  let updateCourse = function (CourseObj, edit, successCB, errorCB) {
    if(edit === 'edit') {
      let query = `MATCH (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}'})-[r:${graphConsts.REL_INCLUDES}]->()
          delete r
          set c.Name = '${CourseObj.Name}',
          c.Mode = '${CourseObj.Mode}',c.Duration = ${CourseObj.Duration},
          c.History = '${CourseObj.History}',
          c.Removed = ${CourseObj.Removed}
          with c as course
          UNWIND ${JSON.stringify(CourseObj.Skills)} as skill
          MERGE (n:${graphConsts.NODE_SKILL}{Name:skill})
          MERGE (n)<-[:${graphConsts.REL_INCLUDES}]-(course);`
          let session = driver.session();
             session.run(query).then(function (resultObj, err) {
                 session.close();
               if(err) {
                 errorCB('Error');
               } else {
                 successCB('success');
                }
               });
  } else if(edit === 'assignment') {
        let assignment = CourseObj.Assignments[CourseObj.Assignments.length - 1]
        console.log(CourseObj.ID)
        let query = `MATCH (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}'})
        with c as course
        MERGE (assg:${graphConsts.NODE_ASSIGNMENT}{Name:'${assignment.Name}',
        Description: '${assignment.Description}',
        Week: ${assignment.Week},
        Duration: ${assignment.Duration}})
        with assg as assg,course as course
        MERGE (assg)<-[:${graphConsts.REL_HAS}]-(course)
        with assg as assg
        UNWIND ${JSON.stringify(assignment.Skills)} as skill
        MERGE (n:${graphConsts.NODE_SKILL}{Name:skill})
        MERGE (n)<-[:${graphConsts.REL_INCLUDES}]-(assg);
        `
        let session = driver.session();
           session.run(query).then(function (resultObj, err) {
               session.close();
             if(err) {
               errorCB('Error');
             } else {
               successCB('success');
              }
             });
  } else if(edit === 'schedule') {
            let schedule = CourseObj.Schedule[CourseObj.Schedule.length - 1]
            console.log(CourseObj.ID)
            let query = ``;
            if(schedule.Skills.length >= 1) {
              query = `MATCH (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}'})
              with c as course
              MERGE (schedule:${graphConsts.NODE_SESSION}{Name:'${schedule.Name}',
              Description: '${schedule.Description}',
              Day: ${schedule.Day}})
              with schedule as schedule,course as course
              MERGE (schedule)<-[:${graphConsts.REL_HAS}]-(course)
              with schedule as schedule
              UNWIND ${JSON.stringify(schedule.Skills)} as skill
              MERGE (n:${graphConsts.NODE_SKILL}{Name:skill})
              MERGE (n)<-[:${graphConsts.REL_INCLUDES}]-(schedule);
              `
            }
            else {
              query = `MATCH (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}'})
              with c as course
              MERGE (schedule:${graphConsts.NODE_SESSION}{Name:'${schedule.Name}',
              Description: '${schedule.Description}',
              Day: ${schedule.Day}})
              with schedule as schedule,course as course
              MERGE (schedule)<-[:${graphConsts.REL_HAS}]-(course);
              `
            }
            let session = driver.session();
               session.run(query).then(function (resultObj, err) {
                   session.close();
                 if(err) {
                   errorCB('Error');
                 } else {
                   successCB('success');
                  }
                 });
  }
  };

/**********************************************
************ Product management *************
**********************************************/

// adding a new product
let addProduct = function (projectObj, successCB, errorCB) {

   let product = {};
   product.product = projectObj.product;
   product.description = projectObj.description || '';

   let version = {};
   version.name = projectObj.version[0].name;
   version.description = projectObj.version[0].description || '';
   // version.wave = projectObj.version[0].wave;
   // version.members = projectObj.version[0].members;
   version.skills = projectObj.version[0].skills;
   version.addedBy = projectObj.version[0].addedBy;
   version.addedOn = projectObj.version[0].addedOn;
   version.updated = projectObj.version[0].updated;

   let session = driver.session();

   logger.debug("obtained connection with neo4j");

   let query  =
     `CREATE
     (product:${graphConsts.NODE_PRODUCT}
       {
        name: '${product.product}',
        description: '${product.description}'
       }
     )
     -[:${graphConsts.REL_HAS}]->
     (version:${graphConsts.NODE_VERSION}
       {
        name: '${version.name}',
        description: '${version.description}',
        addedOn: '${version.addedOn}',
        addedBy: '${version.addedBy}',
        updated: '${version.updated}'
       }
     )
     WITH version AS version
     UNWIND ${JSON.stringify(version.skills)} AS skillname
     MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
     MERGE (version) -[:${graphConsts.REL_INCLUDES}]-> (skill)
     `;

   session.run(query)
     .then(function(result) {
       logger.debug('Result from the neo4j', result)

       // Completed!
       session.close();
       successCB(projectObj);
     })
     .catch(function(err) {
       errorCB(err);
     });
  };

  // adding a version
  let addVersion = function (name, versionObj, successCB, errorCB) {

     let productName = name;

     let version = {};
     version.name = versionObj.name;
     version.description = versionObj.description || '';
     // version.wave = versionObj.wave;
     // version.members = versionObj..members;
     version.skills = versionObj.skills;
     version.addedBy = versionObj.addedBy;
     version.addedOn = versionObj.addedOn;
     version.updated = versionObj.updated;

     let session = driver.session();

     logger.debug("obtained connection with neo4j");

     let query  =
       `
       CREATE
       (version:${graphConsts.NODE_VERSION}
         {
           name: '${version.name}',
           description: '${version.description}',
           addedOn: '${version.addedOn}',
           addedBy: '${version.addedBy}',
           updated: '${version.updated}'
         }
       )
       WITH version AS version
       MERGE (product:${graphConsts.NODE_PRODUCT} {name: '${productName}'})
       MERGE (version) <-[:${graphConsts.REL_HAS}]- (product)
       WITH version AS version
       UNWIND ${JSON.stringify(version.skills)} AS skillname
       MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
       MERGE (version) -[:${graphConsts.REL_INCLUDES}]-> (skill)
       `;

     session.run(query)
       .then(function(result) {
         logger.debug('Result from the neo4j', result)

         // Completed!
         session.close();
         successCB(versionObj);
       })
       .catch(function(err) {
         errorCB(err);
       });
  };


  module.exports = {
    addCadet,
    getCadets,
    getNewCadets,
    addCourse,
    getCourses,
    updateCourse,
    addProduct,
    addVersion
  }
