const neo4jDriver = require('neo4j-driver').v1;
const logger = require('./../../applogger');
const config = require('./../../config');
const adminMongoController = require('../admin/adminMongoController.js');
const graphConsts = require('./../common/graphConstants');

let driver = neo4jDriver.driver(config.NEO4J.neo4jURL, neo4jDriver.auth.basic(config.NEO4J.usr, config.NEO4J.pwd), {encrypted: false});

let deleteDanglingNodes = function(label) {
  let query = `MATCH (n:${label}) where SIZE((n)--())=0 DELETE n`;
  let session = driver.session();
  session.run(query).then(function(result, err) {
    session.close();
  });
};

/**********************************************
************ Candidate Management *************
**********************************************/

// adding cadet
let addCadet = function(cadetObj, successCB, errorCB) {

  console.log(cadetObj);

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
  cadet.Remarks = cadetObj.Remarks || ''

  let session = driver.session();

  let query = `CREATE (n: ${graphConsts.NODE_CANDIDATE}
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
  session.run(query).then(function(result) {
    session.close();
    successCB(cadetObj);
  }).catch(function(err) {
    console.log(err);
    errorCB(err);
  });
}

// updating a cadet
let updateCadet = function(cadetObj, successCB, errorCB) {

  let cadet = {};

  cadet.EmployeeID = cadetObj.EmployeeID || '';
  cadet.AltEmail = cadetObj.AltEmail || '';
  cadet.Contact = cadetObj.Contact || '';
  cadet.CareerBand = cadetObj.CareerBand || '';
  cadet.WorkExperience = cadetObj.WorkExperience || '';
  cadet.Billability = cadetObj.Billability || '';
  cadet.PrimarySupervisor = cadetObj.PrimarySupervisor || '';
  cadet.ProjectSupervisor = cadetObj.ProjectSupervisor || '';
  cadet.Selected = cadetObj.Selected || '';
  cadet.Remarks = cadetObj.Remarks || '';
  cadet.AssetID = cadetObj.AssetID || '';
  let session = driver.session();

  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{EmployeeID: '${cadet.EmployeeID}'})
    SET
      n.AltEmail = '${cadet.AltEmail}',
      n.Contact = '${cadet.Contact}',
      n.CareerBand = '${cadet.CareerBand}',
      n.WorkExperience = '${cadet.WorkExperience}',
      n.Billability = '${cadet.Billability}',
      n.PrimarySupervisor = '${cadet.PrimarySupervisor}',
      n.ProjectSupervisor = '${cadet.ProjectSupervisor}',
      n.Selected = '${cadet.Selected}',
      n.Remarks = '${cadet.Remarks}',
      n.AssetID = '${cadet.AssetID}'
    return n`;

  session.run(query).then(function(result) {
    session.close();
    successCB(cadetObj);
  }).catch(function(err) {
    errorCB(err);
  });
}

// updating cadets
let updateCadets = function(cadetArr, successCB, errorCB) {
  let count = 0;
  cadetArr.map(function(cadet) {
    updateCadet(cadet, function(cadetObj) {
      count = count + 1;
      if (count == cadetArr.length) {
        successCB()
      }
    }, function(err) {
      errorCB(err);
    })
  })
}

// delete cadets
let deleteCadet = function(cadetObj, successCB, errorCB) {
  let session = driver.session();
  let query =
    `MATCH (c:${graphConsts.NODE_CANDIDATE}{EmployeeID:'${cadetObj.EmployeeID}'}) DETACH DELETE c`;
  session.run(query).then(function(resultObj) {
    session.close();
    successCB({status:'success'});
  }).catch(function(err) {
    errorCB(err);
  })
}
// fetching all the cadets
// let getCadets = function(successCB, errorCB) {
//   let session = driver.session();
//   let query = `MATCH (c: ${graphConsts.NODE_CANDIDATE}),(w: ${graphConsts.NODE_WAVE})
//     MATCH (c)-[:${graphConsts.REL_BELONGS_TO}]->(w)
//     RETURN c`;
//   session.run(query).then(function(resultObj) {
//     session.close();
//     let cadets = [];
//     for (let i = 0; i < resultObj.records.length; i++) {
//       let result = resultObj.records[i];
//       cadets.push(result._fields[0].properties);
//     }
//     successCB(cadets);
//   }).catch(function(err) {
//     errorCB(err);
//   })
// }

// fetching all the cadets with wave and project details
let getAllCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query =
    `match (c:${graphConsts.NODE_CANDIDATE})-[:${graphConsts.REL_BELONGS_TO}]->(w:${graphConsts.NODE_WAVE})
    with c as candidate, w as wave
    optional match (candidate)-[w:worked_on]->(p:${graphConsts.NODE_PRODUCT})-[:has]->(v:${graphConsts.NODE_VERSION}{name:w.version})-[:${graphConsts.REL_INCLUDES}]->(s:${graphConsts.NODE_SKILL})
    with p as product, candidate as candidate, wave as wave, v as version, s as skill
    return {
    		candidate:candidate,
    		product: version,
        wave: wave,
        skill: COLLECT(DISTINCT skill.Name)
    }`;
  session.run(query).then(function(resultObj) {
    session.close();
    let cadets = [];
    let waves = [];
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
      cadets.push(result._fields[0].candidate.properties);
      if(result._fields[0].product != null) {
        cadets[i].ProjectName = result._fields[0].product.properties.name;
        cadets[i].ProjectDescription = result._fields[0].product.properties.description;
        cadets[i].ProjectSkills = result._fields[0].skill;
      }
      else {
        cadets[i].ProjectName = '';
        cadets[i].ProjectDescription = '';
        cadets[i].ProjectSkills = '';
      }
      cadets[i].Wave = result._fields[0].wave.properties.WaveID + ' (' + result._fields[0].wave.properties.CourseName + ')';
    }
    successCB(cadets);
  }).catch(function(err) {
    errorCB(err);
  })
}


// fetching candidate logged in
// let getCadet = function(email, successCB, errorCB) {
//   let session = driver.session();
//   let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{EmailID:'${email}'})-[:${graphConsts.REL_BELONGS_TO}]->(w:${graphConsts.NODE_WAVE}) return n`;
//   session.run(query).then(function(resultObj) {
//     session.close();
//     console.log('done');
//     successCB(resultObj.records[0]._fields[0].properties);
//   }).catch(function(err) {
//     errorCB(err);
//   })
// }

// fetching candidate's Skill
let getCadetSkills = function(email, successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{EmailID:'${email}'})-[:${graphConsts.REL_KNOWS}]->(s:${graphConsts.NODE_SKILL}) return COLLECT(DISTINCT s.Name)`;
  session.run(query).then(function(resultObj) {
    session.close();
    console.log('done');
    successCB(resultObj.records[0]._fields[0]);
  }).catch(function(err) {
    errorCB(err);
  })
}

// fetching all the new cadets
let getNewCadets = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) WHERE NOT
    (n)-[:${graphConsts.REL_BELONGS_TO}]->(:${graphConsts.NODE_WAVE})
    return n`;
  session.run(query).then(function(resultObj) {
    session.close();
    let cadets = [];

    resultObj.records.map(function(result) {
      cadets.push(result._fields[0].properties);
    })
    successCB(cadets);
  }).catch(function(err) {
    errorCB(err);
  })
}

// Get the filtered cadets
let getFilteredCadets = function(filterQuery, successCB, errorCB) {

  logger.debug('Filter Query', filterQuery)
  let session = driver.session();
  let addFilter = false;
  let condition = 'WHERE ';

  if (filterQuery.EmployeeID != '') {
    addFilter = true;
    condition += `n.EmployeeID = '${filterQuery.EmployeeID}' AND `
  }
  if (filterQuery.EmployeeName != '') {
    addFilter = true;
    condition += `n.EmployeeName = '${filterQuery.EmployeeName}' AND `
  }
  if (filterQuery.EmailID != '') {
    addFilter = true;
    condition += `n.EmailID = '${filterQuery.EmailID}' AND `
  }
  if (filterQuery.DigiThonScore != '') {
    addFilter = true;
    condition += `n.DigiThonScore > '${filterQuery.DigiThonScore}' AND `
  }
  if (filterQuery.Wave != '') {
    addFilter = true;
    let wave = filterQuery.Wave.split('(')[0].trim();
    let course = filterQuery.Wave.split('(')[1].split(')')[0];
    condition += `w.WaveID = '${wave}' AND w.CourseName = '${course}' AND `
  }
  if(filterQuery.Billability.length > 0) {
    addFilter = true;
    let bill_arr = '';
    filterQuery.Billability.map(function (bill) {
      bill_arr += "'" + bill + "', ";
    })
    bill_arr = bill_arr.substring(0, bill_arr.length-2);
    condition += `n.Billability IN [${bill_arr}] AND`
  }

  if (addFilter) {
    condition = condition.substr(0, condition.length - 4);
  } else {
    condition = '';
  }

  let skills = '';
  let skill_arr = '';
  if(filterQuery.Skills.length > 0) {
    filterQuery.Skills.map(function(skill) {
      skill_arr += "'" + skill + "', ";
    })
    skill_arr = skill_arr.substring(0, skill_arr.length-2);
    skills = `WITH n as n
      MATCH (n)-[: ${graphConsts.REL_KNOWS}]->(s: ${graphConsts.NODE_SKILL})
      WHERE s.Name IN [${skill_arr}]`
  }

  let query = `MATCH(n: ${graphConsts.NODE_CANDIDATE})-[:${graphConsts.REL_BELONGS_TO}]->
    (w:${graphConsts.NODE_WAVE})
      ${condition}
      ${skills}
      optional match (n)-[ver:worked_on]->(p:${graphConsts.NODE_PRODUCT})-[:has]->(v:${graphConsts.NODE_VERSION}{name:ver.version})-[:${graphConsts.REL_INCLUDES}]->(s:${graphConsts.NODE_SKILL})
      with p as product, n as candidate, w as wave, v as version, s as skill
    RETURN {
      candidate: candidate,
      wave: wave,
      product: version,
      skill: COLLECT(DISTINCT skill.Name)
    }`;

  logger.debug('Query for the search', query);

  session.run(query).then(function(resultObj, err) {
    session.close();
    if (resultObj) {
      let cadets = [];
      console.log(resultObj.records[0]._fields[0])
      resultObj.records.map(function(record, key) {
        cadets.push(record._fields[0].candidate.properties);
        cadets[key].Wave = record._fields[0].wave.properties.WaveID + ' (' + record._fields[0].wave.properties.CourseName + ')';
        if(record._fields[0].product !== null && record._fields[0].product !== undefined) {
          cadets[key].ProjectName = record._fields[0].product.properties.name;
          cadets[key].ProjectDescription = record._fields[0].product.properties.description;
          cadets[key].ProjectSkills = record._fields[0].skill;
        }
        else {
          cadets[key].ProjectName = '';
          cadets[key].ProjectDescription = '';
          cadets[key].ProjectSkills = '';
        }
      })
      successCB(cadets);
    } else {
      errorCB(err);
    }
  });
}

/**********************************************
************ Candidate Management *************
**********************************************/

// Fetch all the skills
let getSkills = function(successCB, errorCB) {

  let session = driver.session();
  let query = `MATCH (c: ${graphConsts.NODE_SKILL}) RETURN c`;

  session.run(query).then(function(resultObj) {
    session.close();
    let skills = [];
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
      skills.push(result._fields[0].properties);
    }
    successCB(skills);
  }).catch(function(err) {
    errorCB(err);
  })
}

/**********************************************
************** Course Management **************
**********************************************/

// adding a course
let addCourse = function(CourseObj, successCB, errorCB) {
  logger.info(CourseObj);
  let query = `MERGE (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}',Name:'${CourseObj.Name}',
  Mode:'${CourseObj.Mode}',Duration:${CourseObj.Duration},History:'${CourseObj.History}',
  Removed:${CourseObj.Removed},FeedbackFields: ${JSON.stringify(CourseObj.FeedbackFields)}}) WITH c AS course
  UNWIND ${JSON.stringify(CourseObj.Skills)} AS skill
  MERGE (n:${graphConsts.NODE_SKILL}{Name:skill})
  MERGE (n)<-[:${graphConsts.REL_INCLUDES} {credit: 1}]-(course);`;
  let session = driver.session();
  session.run(query).then(function(resultObj, err) {
    session.close();
    if (resultObj) {
      logger.debug(resultObj);
      successCB();
    } else {
      errorCB(err);
    }
  });
};

let getCourses = function(successCB, errorCB) {
  let query = `MATCH (courses:${graphConsts.NODE_COURSE})
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_INCLUDES}]->(s:${graphConsts.NODE_SKILL})
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_HAS}]->(a:${graphConsts.NODE_ASSIGNMENT})-[:${graphConsts.REL_INCLUDES}]->(aSkill:${graphConsts.NODE_SKILL})
  with collect(aSkill.Name) as assgSkill, a as a, courses as courses,s as s
  OPTIONAL MATCH (courses)-[:${graphConsts.REL_HAS}]->(se:${graphConsts.NODE_SESSION})
  optional match (se)-[:${graphConsts.REL_INCLUDES}]->(seSkill:${graphConsts.NODE_SKILL})
  with collect(seSkill.Name) as sessSkill, assgSkill as assgSkill, a as a, courses as courses,s as s,se as se
  return courses, collect(distinct s.Name) as skills,COLLECT(distinct {a: a, b: assgSkill}) as assg,COLLECT(distinct {a: se, b: sessSkill}) as session`;
  let session = driver.session();
  session.run(query).then(function(resultObj, err) {
    session.close();
    let courseArray = [];
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
      courseArray.push(result._fields[0].properties);
      courseArray[i].Skills = result._fields[1];
      if (result._fields[2][0].a === null) {
        courseArray[i].Assignments = [];
      } else {
        let Assignments = [];
        for (let j = 0; j < result._fields[2].length; j++) {
          Assignments.push(result._fields[2][j].a.properties);
          Assignments[j].Skills = result._fields[2][j].b;
        }
        courseArray[i].Assignments = Assignments
      }
      if (result._fields[3][0].a === null) {
        courseArray[i].Schedule = [];
      } else {
        let Session = [];
        for (let j = 0; j < result._fields[3].length; j++) {
          Session.push(result._fields[3][j].a.properties);
          Session[j].Skills = result._fields[3][j].b;
        }
        courseArray[i].Schedule = Session
      }
    }
    if (err) {
      errorCB('Error');
    } else {
      successCB(courseArray);
    }
  });
};

let updateCourse = function(CourseObj, edit, successCB, errorCB) {
  if (edit === 'edit') {
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
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        let query1 = `MATCH (n:${graphConsts.NODE_SKILL}) where SIZE((n)--())=0 DELETE n`;
        let session1 = driver.session();
        session1.run(query1).then(function(resultObj, err) {
          session1.close();
        });
        successCB('success');
      }
    });
  } else if (edit === 'assignment') {
    let assignment = CourseObj.Assignments[CourseObj.Assignments.length - 1]
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
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        successCB('success');
      }
    });
  } else if (edit === 'schedule') {
    let schedule = CourseObj.Schedule[CourseObj.Schedule.length - 1]
    let query = ``;
    if (schedule.Skills.length >= 1) {
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
    } else {
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
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        successCB('success');
      }
    });
  }
};

let deleteOrRestoreCourse = function(CourseObj, type, successCB, errorCB) {
  if (type === 'delete') {
    let query = `MATCH (c:${graphConsts.NODE_COURSE}{ID:'${CourseObj.ID}'})-[r:${graphConsts.REL_INCLUDES}]->()
          set c.Removed = true
          return c`;
    let session = driver.session();
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        successCB('success');
      }
    });
  } else {
    let query = `UNWIND ${JSON.stringify(CourseObj)} as id
      MATCH (c:${graphConsts.NODE_COURSE}{ID:id})-[r:${graphConsts.REL_INCLUDES}]->()
      set c.Removed = false`;
    let session = driver.session();
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        successCB('success');
      }
    });
  }
}

let deleteAssignmentOrSchedule = function(obj, course, type, successCB, errorCB) {
  if (type === 'assignment') {
    let query = `MATCH (s:${graphConsts.NODE_ASSIGNMENT}{Name:'${obj.Name}'})<-[:${graphConsts.REL_HAS}]-(c:${graphConsts.NODE_COURSE}) return count(c);`
    let session = driver.session();
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        if (resultObj.records[0]._fields[0].low <= 1) {
          let query1 = `MATCH (s:${graphConsts.NODE_ASSIGNMENT}{Name:'${obj.Name}'}) detach delete s;`
          let session1 = driver.session();
          session1.run(query1).then(function(resultObj, err) {
            session1.close();
            if (err) {
              errorCB('Error');
            } else {
              successCB();
            }
          });
        } else {
          let query1 = `MATCH (s:${graphConsts.NODE_ASSIGNMENT}{Name:'${obj.Name}'})<-[r:${graphConsts.REL_HAS}]-(c:${graphConsts.NODE_COURSE}{Name:'${course.Name}'}) delete r`
          let session1 = driver.session();
          session1.run(query1).then(function(resultObj, err) {
            session1.close();
            if (err) {
              errorCB('Error');
            } else {
              successCB();
            }
          })
        }
      }
    });
  } else {
    let query = `MATCH (s:${graphConsts.NODE_SESSION}{Name:'${obj.Name}'})<-[:${graphConsts.REL_HAS}]-(c:${graphConsts.NODE_COURSE}) return count(c);`
    let session = driver.session();
    session.run(query).then(function(resultObj, err) {
      session.close();
      if (err) {
        errorCB('Error');
      } else {
        if (resultObj.records[0]._fields[0].low <= 1) {
          let query1 = `MATCH (s:${graphConsts.NODE_SESSION}{Name:'${obj.Name}'}) detach delete s;`
          let session1 = driver.session();
          session1.run(query1).then(function(resultObj, err) {
            session1.close();
            if (err) {
              errorCB('Error');
            } else {
              successCB();
            }
          })
        } else {
          let query1 = `MATCH (s:${graphConsts.NODE_SESSION}{Name:'${obj.Name}'})<-[r:${graphConsts.REL_HAS}]-(c:${graphConsts.NODE_COURSE}{Name:'${course.Name}'}) delete r`
          let session1 = driver.session();
          session1.run(query1).then(function(resultObj, err) {
            session1.close();
            if (err) {
              errorCB('Error');
            } else {
              successCB();
            }
          })
        }
      }
    });
  }
}

/**********************************************
************ Product Management ***************
**********************************************/

// adding a new product
let addProduct = function(productObj, successCB, errorCB) {

  let product = {};
  product.product = productObj.product;

  let version = {};
  version.name = productObj.version[0].name;
  version.description = productObj.version[0].description || '';
  version.wave = productObj.version[0].wave || '';
  version.members = productObj.version[0].members.map(function(member) {
    return member.EmployeeName
  });
  version.skills = productObj.version[0].skills;
  version.addedBy = productObj.version[0].addedBy;
  version.addedOn = productObj.version[0].addedOn;
  version.updated = productObj.version[0].updated;

  let session = driver.session();

  let query = `CREATE
     (product:${graphConsts.NODE_PRODUCT}
       {
        name: '${product.product}'
       }
     )
     -[:${graphConsts.REL_HAS}]->
     (version:${graphConsts.NODE_VERSION}
       {
        name: '${version.name}',
        description: '${version.description}',
        wave: '${version.wave}',
        addedOn: '${version.addedOn}',
        addedBy: '${version.addedBy}',
        updated: '${version.updated}'
       }
     )
     WITH version AS version, product AS product
     UNWIND ${JSON.stringify(version.skills)} AS skillname
     MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
     MERGE (version) -[:${graphConsts.REL_INCLUDES}]-> (skill)
     WITH version AS version, product AS product
     UNWIND ${JSON.stringify(version.members)} AS employeeName
     UNWIND ${JSON.stringify(version.skills)} AS skillname
     MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
     MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeName: employeeName})
     MERGE (skill) <-[:${graphConsts.REL_KNOWS} {totalCredits: 0, totalRating: 0}]- (employee)
     WITH product AS product
     UNWIND ${JSON.stringify(version.members)} AS employeeName
     MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeName: employeeName})
     MERGE (product) <-[:${graphConsts.REL_WORKEDON} {version: '${version.name}'}]- (employee)
     `;

  session.run(query).then(function(result) {

    // Completed!
    session.close();
    successCB(productObj);
  }).catch(function(err) {
    errorCB(err);
  });
};

// adding a version
let addVersion = function(name, versionObj, successCB, errorCB) {

  let productName = name;

  let version = {};
  version.name = versionObj.name;
  version.description = versionObj.description || '';
  version.wave = versionObj.wave || '';
  version.members = versionObj.members.map(function(member) {
    return member.EmployeeName
  });
  version.skills = versionObj.skills;
  version.addedBy = versionObj.addedBy;
  version.addedOn = versionObj.addedOn;
  version.updated = versionObj.updated;

  let session = driver.session();

  let query = `
       CREATE
       (version:${graphConsts.NODE_VERSION}
         {
           name: '${version.name}',
           description: '${version.description}',
           wave: '${version.wave}',
           addedOn: '${version.addedOn}',
           addedBy: '${version.addedBy}',
           updated: '${version.updated}'
         }
       )
       WITH version AS version
       MERGE (product:${graphConsts.NODE_PRODUCT} {name: '${productName}'})
       MERGE (version) <-[:${graphConsts.REL_HAS}]- (product)
       WITH version AS version, product AS product
       UNWIND ${JSON.stringify(version.skills)} AS skillname
       MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
       MERGE (version) -[:${graphConsts.REL_INCLUDES}]-> (skill)
       WITH version AS version, product AS product
       UNWIND ${JSON.stringify(version.members)} AS employeeName
       UNWIND ${JSON.stringify(version.skills)} AS skillname
       MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
       MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeName: employeeName})
       MERGE (skill) <-[:${graphConsts.REL_KNOWS} {rating: 'nil'}]- (employee)
       WITH product AS product
       UNWIND ${JSON.stringify(version.members)} AS employeeName
       MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeName: employeeName})
       MERGE (product) <-[:${graphConsts.REL_WORKEDON} {version: '${version.name}'}]- (employee)
       `;

  session.run(query).then(function(result, err) {
    session.close();
    if (err) {
      errorCB(err);
    } else {
      successCB(versionObj);
    }
  }).catch(function(err) {
    errorCB(err);
  });
};

// editing a version
let updateVersion = function(version, successCB, errorCB) {

  console.log('inside update version');

  let session = driver.session();
  let employeeIDs = version.members.map(function(member) {
    return member.EmployeeID
  });

  let query = `
          MATCH (version:${graphConsts.NODE_VERSION} {name: '${version.name}'})
          -[skillsRelation:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
          DELETE skillsRelation
          WITH COLLECT(skill.Name) AS skills, version AS version
          UNWIND (skills) AS skillName
          MATCH (candidate:${graphConsts.NODE_CANDIDATE})
          -[skillsRelation:${graphConsts.REL_KNOWS}]-> (:${graphConsts.NODE_SKILL} {Name: skillName})
          DELETE skillsRelation
          WITH version AS version
          MATCH (candidate:${graphConsts.NODE_CANDIDATE})
          -[productRelation:${graphConsts.REL_WORKEDON} {version: version.name}]-> (:${graphConsts.NODE_PRODUCT})
          DELETE productRelation
          WITH version AS version
          SET version.description='${version.description}',
          version.addedOn='${String(version.addedOn)}',
          version.addedBy='${version.addedBy}',
          version.updated=${version.updated}
          WITH version AS version
          MATCH (product:${graphConsts.NODE_PRODUCT})
          -[:${graphConsts.REL_HAS}]-> (:${graphConsts.NODE_VERSION} {name: version.name})
          WITH version AS version, product AS product
          UNWIND ${JSON.stringify(version.skills)} AS skillname
          MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
          MERGE (version) -[:${graphConsts.REL_INCLUDES}]-> (skill)
          WITH version AS version, product AS product
          UNWIND ${JSON.stringify(employeeIDs)} AS employeeID
          UNWIND ${JSON.stringify(version.skills)} AS skillname
          MERGE (skill:${graphConsts.NODE_SKILL} {Name: skillname})
          MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeID: employeeID})
          MERGE (skill) <-[:${graphConsts.REL_KNOWS} {rating: 'nil'}]- (employee)
          WITH product AS product
          UNWIND ${JSON.stringify(employeeIDs)} AS employeeID
          MERGE (employee:${graphConsts.NODE_CANDIDATE} {EmployeeID: employeeID})
          MERGE (product) <-[:${graphConsts.REL_WORKEDON} {version: '${version.name}'}]- (employee)
         `;

  session.run(query).then(function(result, err) {
    session.close();
    if (err) {
      errorCB(err);
    } else {
      deleteDanglingNodes(graphConsts.NODE_SKILL);
      successCB(version);
    }
  }).catch(function(err) {
    errorCB(err);
  });

};

// deleting a product
let deleteProduct = function(productName, successCB, errorCB) {

  let session = driver.session();

  let query = `
       MATCH (version:${graphConsts.NODE_VERSION})
       <-[:${graphConsts.REL_HAS}]-
       (product:${graphConsts.NODE_PRODUCT} {name: '${productName}'})
       WITH COLLECT(version) AS versions, product AS product
       UNWIND(versions) AS version
       MATCH (version) -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
       WITH COLLECT (skill) AS skills, version AS version, version.name AS versionName, product AS product
       DETACH DELETE version
       WITH skills AS skills, versionName AS versionName, product AS product
       MATCH (candidate:${graphConsts.NODE_CANDIDATE})
       -[workedonRelation:${graphConsts.REL_WORKEDON} {version: versionName}]->
       (product:${graphConsts.NODE_PRODUCT})
       WITH COLLECT(workedonRelation) AS workedonRelations, product AS product,
       COLLECT(candidate) AS candidates, skills AS skills
       UNWIND (candidates) AS candidate
       UNWIND (skills) AS skill
       MATCH (candidate)
       -[knowsRelation:${graphConsts.REL_KNOWS}]-> (skill)
       DELETE knowsRelation
       WITH workedonRelations AS workedonRelations, product AS product
       UNWIND (workedonRelations) AS workedonRelation
       DELETE workedonRelation
       WITH product AS product
       DETACH DELETE product
       `;

  session.run(query).then(function(result, err) {
    session.close();
    if (err) {
      errorCB(err);
    } else {
      deleteDanglingNodes(graphConsts.NODE_SKILL);
      successCB(productName);
    }
  }).catch(function(err) {
    errorCB(err);
  });
};

// deleting a version
let deleteVersion = function(versionName, successCB, errorCB) {

  let session = driver.session();

  let query = `
       MATCH (version:${graphConsts.NODE_VERSION} {name: '${versionName}'})
       WITH version as version, version.name AS versionName
       MATCH (version) -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
       WITH COLLECT (skill) AS skills, version AS version, versionName AS versionName
       DETACH DELETE version
       WITH skills AS skills, versionName AS versionName
       MATCH (candidate:${graphConsts.NODE_CANDIDATE})
       -[workedonRelation:${graphConsts.REL_WORKEDON} {version: versionName}]->
       (product:${graphConsts.NODE_PRODUCT})
       WITH COLLECT(workedonRelation) AS workedonRelations,
       COLLECT(candidate) AS candidates, skills AS skills
       UNWIND (candidates) AS candidate
       UNWIND (skills) AS skill
       MATCH (candidate)
       -[knowsRelation:${graphConsts.REL_KNOWS}]-> (skill)
       DELETE knowsRelation
       WITH workedonRelations AS workedonRelations
       UNWIND (workedonRelations) AS workedonRelation
       DELETE workedonRelation
       `;

  session.run(query).then(function(result, err) {
    session.close();
    if (err) {
      errorCB(err);
    } else {
      deleteDanglingNodes(graphConsts.NODE_SKILL);
      deleteDanglingNodes(graphConsts.NODE_PRODUCT);
      successCB(versionName);
    }
  }).catch(function(err) {
    errorCB(err);
  });
};

let getProducts = function(successCB, errorCB) {
  let session = driver.session();
  let query = `
   MATCH (product:${graphConsts.NODE_PRODUCT})
   -[:${graphConsts.REL_HAS}]-> (version:${graphConsts.NODE_VERSION})
   WITH COLLECT(version) AS versions, product AS product
   UNWIND versions AS version
   MATCH (version:${graphConsts.NODE_VERSION} {name: version.name})
   -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
   OPTIONAL MATCH (candidate:${graphConsts.NODE_CANDIDATE})
   -[:${graphConsts.REL_WORKEDON} {version: version.name}]-> (product)
   WITH COLLECT(DISTINCT skill.Name) AS skills, version AS version, product AS product,
   CASE WHEN candidate IS NULL THEN
     []
     ELSE
     COLLECT (DISTINCT {
       EmployeeID: candidate.EmployeeID,
       EmployeeName: candidate.EmployeeName
     })
   END AS candidates
   WITH COLLECT({
     name: version.name,
     description: version.description,
     wave: version.wave,
     members: candidates,
     skills: skills,
     addedBy: version.addedBy,
     addedOn: version.addedOn,
     updated: version.updated
   }) AS versions, product AS product
   RETURN {
     product: product.name,
     description: product.description,
     version: versions
   }`;
  session.run(query).then(function(resultObj, err) {
    session.close();
    if (err) {
      errorCB('Error');
    } else {
      successCB(resultObj.records);
    }
  }).catch(function(err) {
    errorCB(err);
  });
};

/**********************************************
************** Wave Management ****************
**********************************************/

// Add a wave
let addWave = function(waveObj, successCB, errorCB) {
  let userObj = {};
  userObj.WaveID = waveObj.WaveID || '',
  userObj.WaveNumber = waveObj.WaveNumber || '',
  userObj.Mode = waveObj.Mode || '',
  userObj.Location = waveObj.Location || '',
  userObj.StartDate = waveObj.StartDate || '',
  userObj.EndDate = waveObj.EndDate || '',
  userObj.Sessions = waveObj.Sessions || '',
  userObj.Cadets = waveObj.Cadets || '',
  userObj.Course = waveObj.Course || '';

  let session = driver.session();

  let query = `CREATE  (wave:${graphConsts.NODE_WAVE}
    {
      WaveID: '${userObj.WaveID}',
      WaveNumber: '${userObj.WaveNumber}',
      Mode: '${userObj.Mode}',
      Location: '${userObj.Location}',
      StartDate: '${userObj.StartDate}',
      EndDate: '${userObj.EndDate}',
      CourseName: '${userObj.Course.split("_")[0]}'
    })
    WITH wave AS wave
    MATCH (course: ${graphConsts.NODE_COURSE}{ID: '${userObj.Course}'})
    WITH wave AS wave, course AS course
    MERGE (wave)-[:${graphConsts.REL_HAS}]->(course)
    WITH wave AS wave
    UNWIND ${JSON.stringify(userObj.Cadets)} AS empID
    MERGE (candidate:${graphConsts.NODE_CANDIDATE} {EmployeeID: empID})
    MERGE (candidate) -[:${graphConsts.REL_BELONGS_TO}]-> (wave)
    RETURN candidate`;
  let count = 0;
  session.run(query).then(function(result) {
    session.close();
    if (waveObj.Cadets.length > 0) {
      result.records.map(function(record) {
        let userObj = {};
        let cadetObj = record._fields[0].properties;
        userObj.name = cadetObj.EmployeeName;
        userObj.email = cadetObj.EmailID;
        userObj.username = cadetObj.EmailID.split('@')[0];
        userObj.password = config.DEFAULT_PASS;
        userObj.role = 'candidate';
        logger.debug('User obj created', userObj);
        adminMongoController.addUser(userObj, function(savedUser) {
          logger.info('New User Created: ', savedUser);
          count = count + 1;
          if (count == waveObj.Cadets.length) {
            successCB(result);
          }
        }, function(err2) {
          logger.error('Error in creating user', err2);
          errorCB(err2);
        });
      })
    } else {
      successCB(result);
    }
  }).catch(function(err) {
    errorCB(err);
  });
}

//removeCadet from wave
let removeCadetFromWave = function(cadets, waveID, course, successCB, errorCB) {
  console.log(cadets)
  console.log(waveID)
  let query = `UNWIND ${JSON.stringify(cadets)} as cadet
   match(n:${graphConsts.NODE_WAVE})
   <-[r:${graphConsts.REL_BELONGS_TO}]-(c:${graphConsts.NODE_CANDIDATE} {EmployeeID:cadet})
   WHERE n.WaveID = '${waveID}' AND n.CourseName = '${course}'
   delete r return c`
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (cadets.length > 0) {
      console.log(resultObj, "resultObj 123");
      resultObj.records.map(function(record) {
        console.log("efgnerjghi")
       let cadetObj = record._fields[0].properties;
        let user = {};
        user.name = cadetObj.EmployeeName;
        user.email = cadetObj.EmailID;
        user.username = cadetObj.EmailID.split('@')[0];
        adminMongoController.deleteUser(user, function(status,err) {
          if (err) {
            logger.error('Delete cadet - Delete User Error: ', err);
          }
          logger.debug('Delete cadet- Delete User Status: ', status);
        });
      });
        successCB();
    } else {
      console.log('error')
      errorCB('Error');
    }
  });

}

// Update a wave
let updateWave = function(waveObj, oldCourse, successCB, errorCB) {
  let query = `MATCH(w:${graphConsts.NODE_WAVE}{WaveID: '${waveObj.WaveID}'})-
      [r:${graphConsts.REL_HAS}]->(c:${graphConsts.NODE_COURSE})
      WHERE w.WaveID = '${waveObj.WaveID}' AND w.CourseName = '${oldCourse}'
    DELETE r
    SET
      w.Location = '${waveObj.Location}',
      w.StartDate = '${waveObj.StartDate}',
      w.EndDate = '${waveObj.EndDate}',
      w.CourseName = '${waveObj.Course.split("_")[0]}'
    WITH w AS w
    MATCH (d:${graphConsts.NODE_COURSE}{ID:'${waveObj.Course}'})
    WITH w AS w, d AS d
    MERGE (w)-[:${graphConsts.REL_HAS}]->(d)
    RETURN w`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      logger.debug(resultObj);
    } else {
      errorCB('Error');
    }
  });
};

// Delete a wave
let deleteWave = function (waveObj, successCB, errorCB) {
  try {
    let query = `MATCH (n:${graphConsts.NODE_WAVE})
      WHERE n.WaveID = '${waveObj.WaveID}' AND n.CourseName = '${waveObj.CourseName}'
      MATCH (c:${graphConsts.NODE_CANDIDATE})-[: ${graphConsts.REL_BELONGS_TO}]->(n)
      DETACH DELETE n
      RETURN c.EmailID`;
    let session = driver.session();
    session.run(query).then(function(resultObj) {
      session.close();
      if (resultObj) {
        let count  = 0;
        resultObj.records.map(function(record) {
          adminMongoController.deleteUser({'email': record._fields[0]}, function (status) {
            count++;
            if(count == resultObj.records.length) {
              successCB(count);
            }
          }, function (err) {
            logger.error('Error', err);
            errorCB('Error');
          });
        })
      } else {
        errorCB('Error');
      }
    });
  } catch(err1) {
    errorCB('Error');
  }
}

// Fetch wave with waveid
let getWave = function(waveID, course, successCB, errorCB) {
  logger.debug('In get Wave', waveID);
  let query = `MATCH(n:${graphConsts.NODE_WAVE})
  WHERE n.WaveID = '${waveID}' AND n.CourseName = '${course}'
  RETURN n`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      successCB(resultObj.records[0]._fields[0].properties);
    } else {
      errorCB('Error');
    }
  });
};

// Get WaveID's of all the waves
let getWaveIDs = function(successCB, errorCB) {
  let query = `MATCH(n:${graphConsts.NODE_WAVE}) RETURN DISTINCT {waveID:n.WaveID, course:n.CourseName}`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      let waves = []
      resultObj.records.map(function(res) {
        waves.push(res._fields[0])
      })
      successCB(waves);
      logger.debug(waves);
    } else {
      errorCB('Error');
    }
  });
};

// Get cadets of wave
let getCadetsOfWave = function(waveID, course, successCB, errorCB) {
  let query = `MATCH(n:${graphConsts.NODE_CANDIDATE})-[${graphConsts.REL_BELONGS_TO}]->(c:${graphConsts.NODE_WAVE})
                WHERE c.WaveID = '${waveID}' AND c.CourseName = '${course}'
                RETURN n`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      let candidateName = []
      resultObj.records.map(function(res) {
        logger.debug(res._fields[0])
        candidateName.push(res._fields[0].properties)
      })
      successCB(candidateName);
      logger.debug(candidateName, "candidateName");
    } else {
      errorCB('Error');
    }
  });
};

// Get all waves
let getWaves = function(successCB, errorCB) {
  let query = `MATCH(w:${graphConsts.NODE_WAVE})-[:${graphConsts.REL_HAS}]->(c:${graphConsts.NODE_COURSE})
    OPTIONAL MATCH (w)<-[r:${graphConsts.REL_BELONGS_TO}]-()
  RETURN w,c, count(r)`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      let waves = []
      resultObj.records.map(function(res) {
        let waveObj = res._fields[0].properties;
        waveObj.Course = res._fields[1].properties.ID;
        waveObj.Cadets = res._fields[2].low;
        waves.push(waveObj);
      })
      successCB(waves);
    } else {
      errorCB('Error');
    }
  });
};

// Get course for a given waveID
let getCourseForWave = function (waveID, course, successCB, errorCB) {
  let query = `
    MATCH(wave:${graphConsts.NODE_WAVE})
    -[:${graphConsts.REL_HAS}]-> (course:${graphConsts.NODE_COURSE})
    WHERE wave.WaveID = '${waveID}' AND wave.CourseName = '${course}'
    RETURN course
    `;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      logger.debug(resultObj);
      successCB(resultObj.records[0]._fields[0].properties);
    } else {
      errorCB('Error');
    }
  });
};

// Update cadets for the wave
let updateWaveCadets = function(cadets, waveID, course, successCB, errorCB) {

  let session = driver.session();

  let query = `UNWIND ${JSON.stringify(cadets)} AS empID
        MATCH (candidate:${graphConsts.NODE_CANDIDATE} {EmployeeID: empID}),
          (wave: ${graphConsts.NODE_WAVE})
          WHERE wave.WaveID = '${waveID}' AND wave.CourseName = '${course}'
        MERGE (candidate)-[:${graphConsts.REL_BELONGS_TO}]->(wave)
        RETURN candidate`;

  let count = 0;
  session.run(query).then(function(result) {
    session.close();
    result.records.map(function(record) {
      let userObj = {};
      let cadetObj = record._fields[0].properties;
      userObj.name = cadetObj.EmployeeName;
      userObj.email = cadetObj.EmailID;
      userObj.username = cadetObj.EmailID.split('@')[0];
      userObj.password = config.DEFAULT_PASS;
      userObj.role = 'candidate';
      logger.debug('User obj created', userObj);
      adminMongoController.addUser(userObj, function(savedUser) {
        logger.info('New User Created: ', savedUser);
        count = count + 1;
        if (count == cadets.length) {
          successCB(result);
        }
      }, function(err2) {
        logger.error('Error in creating user', err2);
        errorCB(err2);
      });
    })

  }).catch(function(err) {
    errorCB(err);
  });
}

// Getting the sessions for the wave
let getSessionForWave = function (waveID, course, successCB, errorCB) {
  logger.debug('In get session Wave', waveID);
  let query = `MATCH(w:${graphConsts.NODE_WAVE})-[:${graphConsts.REL_HAS}]->(m:${graphConsts.NODE_COURSE})-[:${graphConsts.REL_HAS}]->(x:${graphConsts.NODE_SESSION})
  WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
  with w as w, x as x
  OPTIONAL MATCH (x)-[:${graphConsts.REL_INCLUDES}]->(y:${graphConsts.NODE_SKILL}) with w as w, y as y, x as x
  optional match (w)-[r:${graphConsts.REL_INCLUDES}]->(x)
  RETURN {skill:collect(y),session:x,r:r}`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      console.log(resultObj)
      let waveobject = {}
      waveobject.result = []
      resultObj.records.map(function(res) {
        res._fields.map(function(re) {
          waveobject.result.push(re.session.properties)
          waveobject.result[waveobject.result.length - 1].skill = re.skill.map(function(skills) {
            return skills.properties.Name
          })
          if (re.r != null) {
            waveobject.result[waveobject.result.length - 1].SessionBy = re.r.properties.SessionBy;
            waveobject.result[waveobject.result.length - 1].SessionOn = re.r.properties.SessionOn;
            waveobject.result[waveobject.result.length - 1].Status = re.r.properties.Status;
          }
        })
      })
      successCB(waveobject);
    } else {
      errorCB('Error');
    }
  });
};

/**********************************************
************ Assessment Tracker *************
**********************************************/

let getAssessmentTrack = function(waveID, course, successCB, errorCB) {
  let query = `MATCH (a:${graphConsts.NODE_ASSIGNMENT})<-[:${graphConsts.REL_HAS}]-(c:${graphConsts.NODE_COURSE})<-[:${graphConsts.REL_HAS}]-(w:${graphConsts.NODE_WAVE})
  WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
  RETURN COLLECT(a)`;
  let session = driver.session();
  session.run(query).then(function(resultObj, err) {
    session.close();
    if (err) {
      errorCB(err);
    }
    let assessment = [];
    resultObj.records[0]._fields[0].map(function(record) {
      assessment.push(record.properties)
    })
    successCB(assessment);
  });
};

let mapAssessmentTrack = function(assessments, update, successCB, errorCB) {
    assessments.map(function(assessment, key) {
      if (update[key]) {
        let query = `
        MATCH (a:${graphConsts.NODE_ASSIGNMENT}{Name:'${assessment.assignment}'})<-[r:${graphConsts.REL_WORKEDON}]-(c:${graphConsts.NODE_CANDIDATE}{EmployeeID:'${assessment.EmpID}'})
        set r.implement='${assessment.remarks.implement}',
        r.complete='${assessment.remarks.complete}',
        r.learn = '${assessment.remarks.learn}'`
        let session = driver.session();
        session.run(query).then(function (resultObj, err) {
          session.close();
        })
    } else {
      let query = `
        MATCH (a:${graphConsts.NODE_ASSIGNMENT}{Name:'${assessment.assignment}'}),(c:${graphConsts.NODE_CANDIDATE}{EmployeeID:'${assessment.EmpID}'})
        MERGE (a)<-[:${graphConsts.REL_WORKEDON}{implement:'${assessment.remarks.implement}',complete:'${assessment.remarks.complete}',learn:'${assessment.remarks.learn}'}]-(c)`
        let session = driver.session();
        session.run(query).then(function(resultObj, err) {
          session.close();
        })
      }
  }, successCB())
}

let assessmentsandcandidates = function(waveID, assessment, course, successCB, errorCB) {
  let query = `
    MATCH (n:${graphConsts.NODE_CANDIDATE})-[:${graphConsts.REL_BELONGS_TO}]->(c:${graphConsts.NODE_WAVE})
    WHERE c.WaveID = '${waveID}' AND c.CourseName = '${course}'
    with collect(n) as n
    unwind n as cadet
    OPTIONAL MATCH (cadet)-[r:${graphConsts.REL_WORKEDON}]-(a:${graphConsts.NODE_ASSIGNMENT}{Name:'${assessment}'})
    RETURN {cadet:cadet, assignment:r}`
  let session = driver.session();
  let candidates = [];
  session.run(query).then(function(resultObj, err) {
    session.close();
    resultObj.records.map(function(res) {
      let assignment = null;
      if (res._fields[0].assignment != null) {
        assignment = res._fields[0].assignment.properties
      }
      let detail = {
        cadet: res._fields[0].cadet.properties,
        assignment: assignment
      }
      candidates.push(detail);
    })
    successCB(candidates)
  });
}

/**********************************************
************ Attendance *************
**********************************************/

let getWaveOfCadet = function(EmailID, successCB, errorCB) {
  let query = `MATCH (w:${graphConsts.NODE_WAVE})<-[:${graphConsts.REL_BELONGS_TO}]-(c:${graphConsts.NODE_CANDIDATE}{EmailID:'${EmailID}'}) return c,w`
  let session = driver.session();
  session.run(query).then(function(resultObj, err) {
    session.close();
    let candidates = resultObj.records[0]._fields[0].properties;
    candidates.Wave = resultObj.records[0]._fields[1].properties;
    successCB(candidates);
  })
}

//evaluation
let getCadetsAndWave = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE})-[:${graphConsts.REL_BELONGS_TO}]->(w:${graphConsts.NODE_WAVE}) return {candidate:n,wave:w}`;
  session.run(query).then(function(resultObj) {
    session.close();
    let cadets = [];
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
      cadets.push(result._fields[0].candidate.properties);
      console.log(cadets);
      cadets[i].Wave = result._fields[0].wave.properties.WaveID + ' (' + result._fields[0].wave.properties.CourseName + ')';
    }
    successCB(cadets);
  }).catch(function(err) {
    errorCB(err);
  })
}

//Billability
let getBillability = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{Billability:'Billable'}) return n.EmployeeName`;
  session.run(query).then(function(resultObj) {
    session.close();
    let bCadets=[]
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
    bCadets.push(result._fields[0]);
      console.log(bCadets);
    }
    successCB(bCadets);
  }).catch(function(err) {
    errorCB(err);
  })
}


//Non Billability Internal
let getNonBillabilityInternal = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{Billability:'Non-billable(Internal)'}) return  n.EmployeeName`;
  session.run(query).then(function(resultObj) {
    session.close();
    let nbiCadets=[]
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
    nbiCadets.push(result._fields[0]);
      console.log(nbiCadets);
    }
    successCB(nbiCadets);
  }).catch(function(err) {
    errorCB(err);
  })
}

//Non Billability Customer
let getNonBillabilityCustomer = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{Billability:'Non-billable(Customer)'}) return  n.EmployeeName`;
  session.run(query).then(function(resultObj) {
    session.close();
    let nbcCadets=[]
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
    nbcCadets.push(result._fields[0]);
      console.log(nbcCadets);
    }
    successCB(nbcCadets);
  }).catch(function(err) {
    errorCB(err);
  })
}


//Support
let getBillabilitySupport = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{Billability:'Support'}) return n.EmployeeName`;
  session.run(query).then(function(resultObj) {
    session.close();
    let sCadets=[]
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
    sCadets.push(result._fields[0]);
      console.log(sCadets);
    }
    successCB(sCadets);
  }).catch(function(err) {
    errorCB(err);
  })
}

//Free
let getBillabilityFree = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}{Billability:'Free'}) return n.EmployeeName`;
  session.run(query).then(function(resultObj) {
    session.close();
    let fCadets=[]
    for (let i = 0; i < resultObj.records.length; i++) {
      let result = resultObj.records[i];
    fCadets.push(result._fields[0]);
      console.log(fCadets);
    }
    successCB(fCadets);
  }).catch(function(err) {
    errorCB(err);
  })
}
//allBillability
let allBillability = function(successCB, errorCB) {
  let session = driver.session();
  let query = `MATCH (n: ${graphConsts.NODE_CANDIDATE}) return COLLECT(DISTINCT n.Billability)`;
  session.run(query).then(function(resultObj) {
    session.close();
    successCB(resultObj.records[0]._fields[0]);
  }).catch(function(err) {
    errorCB(err);
  })
}

let getCadetProject = function (empID,successCB, errorCB) {
   let session = driver.session();
   let query = `match (c:${graphConsts.NODE_CANDIDATE}{EmployeeID:'${empID}'})-[r:${graphConsts.REL_WORKEDON}]->(p:${graphConsts.NODE_PRODUCT})
                with c as c,r as r,p as p
                match (p)-[:${graphConsts.REL_HAS}]->(v:${graphConsts.NODE_VERSION}{name:r.version})-[:${graphConsts.REL_INCLUDES}]->(s:${graphConsts.NODE_SKILL})
               return {projectName:v.name,projectDesc:v.description,projectSkills:collect(s.Name)}`;
  session.run(query).then(function(resultObj) {
    session.close();
    successCB(resultObj.records[0]._fields[0]);
  }).catch(function(err) {
    errorCB(err);
  })
}

let updateSession = function(wave, waveID, course, successCB, errorCB) {
  console.log(wave, "wave")
  let query = `OPTIONAL MATCH (n:${graphConsts.NODE_SESSION}{Name:'${wave.Name}'})<-[r:${graphConsts.REL_INCLUDES}]-(w:${graphConsts.NODE_WAVE})
              WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
              RETURN r`;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj.records[0]._fields[0] !== null) {
      let query1 = `MATCH (n:${graphConsts.NODE_SESSION}{Name:'${wave.Name}'})<-[r:${graphConsts.REL_INCLUDES}]-(w:${graphConsts.NODE_WAVE})
      WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
      SET
         r.SessionBy = '${wave.SessionBy}',
         r.SessionOn = '${wave.SessionOn}',
         r.Status = '${wave.Status}'
         RETURN n`;
      let session1 = driver.session();
      session1.run(query1).then(function(resultObj) {
        if (resultObj) {
          console.log(resultObj, "first.query")
        }
        session1.close();
      });
      successCB('success');
    } else {
      let query1 = `MATCH (n:${graphConsts.NODE_SESSION}{Name:'${wave.Name}'}),(w:${graphConsts.NODE_WAVE})
      WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
      MERGE (n)<-[r:${graphConsts.REL_INCLUDES}{SessionBy:'${wave.SessionBy}',SessionOn:'${wave.SessionOn}',Status :'${wave.Status}'}]-(w)
         RETURN n`;
      let session = driver.session();
      session.run(query1).then(function(resultObj) {
        if (resultObj) {
          console.log(resultObj, "sec.query")
        }
        session.close();
      });
    }
  });
  successCB();
}

let deleteSession = function (waveObj, waveID, course, successCB, errorCB) {
  let query = `MATCH (n:${graphConsts.NODE_SESSION}{Name:'${waveObj.Name}'})<-[r:${graphConsts.REL_INCLUDES}]-(w:${graphConsts.NODE_WAVE})
              WHERE w.WaveID = '${waveID}' AND w.CourseName = '${course}'
              DELETE r`;
  let session = driver.session();
  session.run(query).then(function(resultObj, err) {

    session.close();
    if (err) {
      errorCB('Error');
    } else {
      successCB('success');
    }
  });
}

/**********************************************
************ Evaluation ***********************
**********************************************/

// Get evaluation skills
let getEvaluationSkills = function(candidateID, successCB, errorCB) {
  let query = `
    MATCH (candidate:${graphConsts.NODE_CANDIDATE} {EmailID: '${candidateID}'})
    WITH candidate AS candidate
    OPTIONAL MATCH (candidate)
    -[v:${graphConsts.REL_WORKEDON}]-> (product:${graphConsts.NODE_PRODUCT})
    WITH v.version AS versionname, candidate AS candidate
    OPTIONAL MATCH (version:${graphConsts.NODE_VERSION} {name: versionname})
    -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
    WITH COLLECT(skill.Name) as skills1, candidate AS candidate
    MATCH (candidate) -[:${graphConsts.REL_BELONGS_TO}]-> (:${graphConsts.NODE_WAVE})
    -[:${graphConsts.REL_HAS}]-> (course:${graphConsts.NODE_COURSE})
    WITH skills1 AS skills1, course AS course
    MATCH (course) -[:${graphConsts.REL_INCLUDES}]-> (skill:${graphConsts.NODE_SKILL})
    WITH COLLECT(skill.Name) AS skills2, skills1
    WITH skills1 + skills2 AS skills
    UNWIND skills AS skill
    WITH COLLECT (DISTINCT skill) AS skillset
    RETURN skillset
    `;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      logger.debug(resultObj);
      successCB(resultObj.records[0]._fields[0]);
    } else {
      errorCB('getEvaluationSkills: Error');
    }
  });
};

// update rating
let updateRating = function(emailID, waveID, skillnames, ratings, successCB, errorCB) {
  let query = `
    MATCH (candidate:${graphConsts.NODE_CANDIDATE} {EmailID: '${emailID}'})
    WITH candidate AS candidate
    MATCH (wave:${graphConsts.NODE_WAVE} {WaveID: '${waveID}'})
    -[:${graphConsts.REL_HAS}]-> (course:${graphConsts.NODE_COURSE})
    WITH course AS course, candidate AS candidate,
    ${JSON.stringify(skillnames)} AS skillnames,
    ${JSON.stringify(ratings)} AS ratings,
    RANGE (0, ${skillnames.length}) AS indices
    UNWIND indices AS index
    MATCH (course) -[i:${graphConsts.REL_INCLUDES}]->
    (:${graphConsts.NODE_SKILL} {Name: skillnames[index]})
    <-[k:${graphConsts.REL_KNOWS}]-(candidate)
    SET k.totalRating=k.totalRating+(ratings[index]*i.credit),k.totalCredits=k.totalCredits+i.credit
    RETURN candidate
    `;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      successCB('SUCCESS');
    } else {
      errorCB('updateRating: Error');
    }
  });
};

/**********************************************
************ SkillSet *************************
**********************************************/


// get all available skills
let getSkillSet = function(successCB, errorCB) {
  let query = `
    MATCH (skill:${graphConsts.NODE_SKILL})
    WITH skill.Name AS skillname ORDER BY skillname
    RETURN COLLECT(skillname)
    `;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      successCB(resultObj.records[0]._fields[0]);
    } else {
      errorCB('getSkillSet: Error');
    }
  });
};

// create a new skill
let createNewSkill = function(skill, successCB, errorCB) {
  let query = `
    CREATE (skill:${graphConsts.NODE_SKILL} {Name: '${skill}'})
    `;
  let session = driver.session();
  session.run(query).then(function(resultObj) {
    session.close();
    if (resultObj) {
      successCB('SUCCESS');
    } else {
      errorCB('createNewSkill: Error');
    }
  });
};

module.exports = {
      addCadet,
      updateCadet,
      updateCadets,
      deleteCadet,
      // getCadets,
      // getCadet,
      getAllCadets,
      getCadetSkills,
      getNewCadets,
      getFilteredCadets,
      getSkills,
      addCourse,
      getCourses,
      updateCourse,
      getWaves,
      addWave,
      updateWave,
      getWave,
      deleteWave,
      getCadetsOfWave,
      updateWaveCadets,
      getWaveIDs,
      addProduct,
      deleteAssignmentOrSchedule,
      deleteOrRestoreCourse,
      addVersion,
      updateVersion,
      deleteProduct,
      deleteVersion,
      getProducts,
      getAssessmentTrack,
      mapAssessmentTrack,
      assessmentsandcandidates,
      getWaveOfCadet,
      getSessionForWave,
      getCadetsAndWave,
      getBillability,
      getBillabilitySupport,
      getNonBillabilityCustomer,
      getNonBillabilityInternal,
      getBillabilityFree,
      allBillability,
      getCadetProject,
      updateSession,
      deleteSession,
      getCourseForWave,
      removeCadetFromWave,
      getEvaluationSkills,
      updateRating,
      getSkillSet,
      createNewSkill
  }
