import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, hashHistory} from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Request from 'superagent';
import App from './views/App.jsx';
import Welcome from './views/Welcome.jsx';
import Login from './components/login/index.jsx';
import Dashboard from './components/dashboard/index.jsx';
import Roles from './components/roleManagement/index.jsx';
import Users from './components/userManagement/index.jsx';
import Candidates from './components/candidateManagement/index.jsx';
import BulkUpload from './components/bulkupload/index.jsx';
import MentorConnect from './components/mentorConnect/index.jsx';
import Courses from './components/courseManagement/index.jsx';
import AssessmentTracker from './components/assessmentTracker/index.jsx';
import ProgramFlow from './components/programFlow/index.jsx';
import MyProfile from './components/myProfile/index.jsx';
import Projects from './components/projectManagement/index.jsx';
import Feedback from './components/feedback/index.jsx';
import EvaluationForms from './components/evaluationForms/index.jsx';
import Attendance from './components/attendance/index.jsx';
import Wave from './components/waveManagement/index.jsx';

injectTapEventPlugin();

const muiTheme = getMuiTheme(lightBaseTheme);
muiTheme.baseTheme.palette.primary1Color = '#202D3E';
muiTheme.appBar.color = '#202D3E';
muiTheme.textField.floatingLabelColor = '#57e161';
muiTheme.textField.hintColor = '#57e161';
muiTheme.textField.textColor = '#57e161';

var user;

let requireAuth = function(nextState, replace, callback) {
  const token = localStorage.getItem('token')
  if (!token) {
  	replace('/')
  	return callback();
  }
  else {
  	Request
  		.get('/dashboard/user')
  		.set({'Authorization': token})
			.end(function(err, res){
				if(err)
					console.log(err)
				else {
					user = res.body
					return callback()
				}
			})
  }
}

let alreadyLoggedIn = function(nextState, replace, callback) {
	console.log('Theme', muiTheme)
  const token = localStorage.getItem('token')
  if(token)
  	replace('/app')
  return callback()
}
let canAccess = function (nextState, replace, callback) {
	if(user) {
		if(user.actions.indexOf('Roles') < 0)
			replace('/app')
	}
	return callback()
}

ReactDOM.render(
	<MuiThemeProvider muiTheme={muiTheme}>
		<Router history={hashHistory}>
			<Route path="/" component={Welcome} onEnter={alreadyLoggedIn} />
			<Route path="/login" component={Login} onEnter={alreadyLoggedIn} />
			<Route path="/app" component={(props)=><App user={user} children={props.children}/>} onEnter={requireAuth} >
				<IndexRoute component={() => <Dashboard user={user} />} />
				<Route path="/roles" component={Roles} />
				<Route path="/users" component={Users} />
				<Route path="/candidates" component={Candidates} />
				<Route path="/bulkupload" component={() => <BulkUpload user={user}/>} />
				<Route path="/mentorconnect" component={() => <MentorConnect user={user}/>} />
				<Route path="/courses" component={Courses} />
				<Route path="/assessmenttracker" component={AssessmentTracker} />
				<Route path="/programflow" component={ProgramFlow} />
				<Route path="/myprofile" component={MyProfile} />
				<Route path="/projects" component={Projects} />
				<Route path="/feedback" component={Feedback} />
				<Route path="/evaluationforms" component={EvaluationForms} />
				<Route path="/attendance" component={Attendance} />
				<Route path="/waves" component={() => <Wave user={user}/>} />
			</Route>
		</Router>
	</MuiThemeProvider>,
	document.getElementById("root")
);
