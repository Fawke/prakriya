let prakriya = {
  WWW_PORT: process.env.PRAKRIYA_WWW_PORT || process.env.PORT || 8080
}

let mongo = {
  host: process.env.MONGO_HOST || '127.0.0.1',
  port: process.env.MONGO_PORT || 27017,
  usr: process.env.MONGO_USR || 'mongo',
  pwd: process.env.MONGO_PWD || 'mongo',
  masterDB: process.env.MONGO_DB || 'prakriya'
};

//@ TODO use mongo username & password in constructing the URL if given
mongo['mongoURL'] = ('mongodb://' + mongo.host + ':' + mongo.port + '/' + mongo.masterDB);

let neo4j = {
  host: process.env.NE04J_HOST || '127.0.0.1',
  http: process.env.NEO4J_HTTP_PORT ||  7474,
  bolt: process.env.NEO4J_BOLT_PORT ||  7687,
  usr: process.env.NEO4J_USR ||  'neo4j',
  pwd: process.env.NEO4J_PWD ||  'neo4js'

};
//@ TODO use neo4j username & password in constructing the URL if given
neo4j['neo4jURL'] = ('bolt://' + neo4j.host + ':' + neo4j.bolt);
neo4j['neo4jHTTPURL'] = ('http://' + neo4j.host + ':' + neo4j.http);

let redis = {
  host : process.env.REDIS_HOST || '127.0.0.1',
  port : process.env.REDIS_PORT || 6379
}
// redis['redisURL'] = ('redis://user:password@host:port/db-number');

let basedata = {
  ACCESS_CONTROLS: [
    {
      name: "Users",
      code: "USERS"
    },
    {
      name: "Roles",
      code: "ROLES"
    },
    {
      name: "Candidates",
      code: "CANDIDATES"
    },
    {
      name: "Mentor Connect",
      code: "MENTOR_CONN"
    },
    {
      name: "Projects",
      code: "PROJECTS"
    },
    {
      name: "Courses",
      code: "COURSES"
    },
    {
      name: "Bulk Upload",
      code: "BULK_UPLOAD"
    },
    {
      name: "Program Flow",
      code: "PROG_FLOW"
    },
    {
      name: "Assessment Tracker",
      code: "ASSG_TRACKER"
    },
    {
      name: "My Profile",
      code: "MY_PROF"
    },
    {
      name: "Evaluation Forms",
      code: "EVAL_FORMS"
    },
    {
      name: "Feedback",
      code: "FEEDBACK"
    },
    {
      name: "Attendance",
      code: "ATTENDANCE"
    },
    {
      name: "Waves",
      code: "WAVES"
    }
  ],
  BASIC_ROLES: [
    {
      name: "admin",
      controls: [
        "USERS",
        "ROLES"
      ]
    },
    {
      name: "wiproadmin",
      controls: [
        "CANDIDATES",
        "BULK_UPLOAD"
      ]
    },
    {
      name: "sradmin",
      controls: [
        "CANDIDATES",
        "MENTOR_CONN",
        "ATTENDANCE",
        "WAVES"
      ]
    },
    {
      name: "mentor",
      controls: [
        "MENTOR_CONN",
        "PROJECTS",
        "COURSES",
        "PROG_FLOW",
        "ASSG_TRACKER",
        "EVAL_FORMS"
      ]
    },
    {
      name: "candidate",
      controls: [
        "MY_PROF",
        "FEEDBACK",
        "ATTENDANCE"
      ]
    }
  ],
  ADMIN_USER: {
    username: "admin",
    password: "admin",
    name: "Admin",
    email: "admin@stackroute.in",
    role: "admin",
  }
}

let candidate_template = [[
  "Sl. No.",
  "EmployeeID",
  "EmployeeName",
  "EmailID",
  "DigiThonQualified",
  "Selected",
  "Remarks",
  "CareerBand",
  "RevisedBU",
  "DigiThonPhase",
  "DigiThonScore",
  "TrainingStatus",
  "TrainingsUndergone",
  "WorkExperience",
  "MentorTrack",
  "TrainingTrack",
  "Wave",
  "CourseName",
  "AcademyTrainingSkills", "StartDate", "EndDate", "CostCenter", "PrimarySupervisor",
  "ProjectSupervisor",
  "College",
  "CGPA",
  "Date"
]]

let remarks_template = [[
  "Sl. No.",
  "EmployeeID",
  "EmployeeName",
  "Remarks",
  "Selected"
]]

let email = {
  USERNAME: 'srprakriya@gmail.com',
  PASSWORD: 'prakriya@123',
  SERVICE_PROVIDER: 'Gmail'
}

let crypto = {
  ALGORITHM: 'aes192',
  PASSWORD: 'password'
}

let config = {
  PRAKRIYA: prakriya,
  MONGO: mongo,
  NEO4J: neo4j,
  REDIS: redis,
  BASEDATA: basedata,
  CANDIDATE_TEMPLATE: candidate_template,
  REMARKS_TEMPLATE: remarks_template,
  EMAIL: email,
  jwtSecret: 'MyS3cr3tK3Y',
  jwtSession: {
    session: false
  },
  CRYPTO: crypto,
  ALL: ['admin', 'wiproadmin', 'sradmin', 'mentor', 'candidate'],
  ADMIN: ['admin', 'wiproadmin', 'sradmin'],
  ADMINISTRATOR: ['wiproadmin', 'sradmin'],
  MENTOR: ['mentor'],
  CANDIDATE: ['candidate'],
  ADMCAN: ['wiproadmin', 'sradmin', 'candidate'],
  MENCAN: ['mentor', 'candidate'],
  ADMMEN: ['wiproadmin', 'sradmin', 'mentor'],
  DEFAULT_PASS: 'digital@123'
};

module.exports = config;
