import React from 'react';
import CourseCard from './CourseCard.jsx';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import RestoreIcon from 'material-ui/svg-icons/content/undo';
import IconButton from 'material-ui/IconButton';
import RestoreCourse from './RestoreCourse.jsx';
import AddCourse from './AddCourse.jsx';
import Assignments from './Assignments.jsx';
import Schedule from './Schedule.jsx';
import SkillSet from './SkillSet.jsx';
import Snackbar from 'material-ui/Snackbar';

const styles = {
	heading: {
		textAlign: 'center'
	},
	col: {
		marginBottom: 20
	},
	restore: {
		position: 'fixed',
		top: '100px',
		right: '50px'
	}
}

const backgroundColors = [
	'#F5DEBF',
	'#DDDBF1',
	'#CAF5B3',
	'#C6D8D3'
	]

const backgroundIcons = [
	'#847662',
	'#666682',
	'#4e5f46',
	'#535f5b'
	]

export default class Courses extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			courses: [],
			skills: [],
			currentCard: {},
			openDialog: false,
			assignmentsDialog: false,
			scheduleDialog: false,
			open: false,
			message: ''
		}

		this.getSkillSet = this.getSkillSet.bind(this);
		this.addNewSkill = this.addNewSkill.bind(this);
		this.getCourses = this.getCourses.bind(this);
		this.updateCourse = this.updateCourse.bind(this);
		this.deleteCourse = this.deleteCourse.bind(this);
		this.openRestoreDialog = this.openRestoreDialog.bind(this);
		this.closeRestoreDialog = this.closeRestoreDialog.bind(this);
		this.handleRestoreCourse = this.handleRestoreCourse.bind(this);
		this.restoreCourses = this.restoreCourses.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.openAssignments = this.openAssignments.bind(this);
		this.closeAssignments = this.closeAssignments.bind(this);
		this.openSchedule = this.openSchedule.bind(this);
		this.closeSchedule = this.closeSchedule.bind(this);
		this.setCurrentCourse = this.setCurrentCourse.bind(this);
		this.subDelete = this.subDelete.bind(this);
		this.handleRequestClose = this.handleRequestClose.bind(this);
	}

	componentWillMount() {
		this.getCourses();
		this.getSkillSet();
	}

	openRestoreDialog() {
		this.setState({
			openDialog: true
		})
	}

	closeRestoreDialog() {
		this.setState({
			openDialog: false
		})
	}

	handleRestoreCourse(actions) {
		this.setState({
			openDialog: false
		})
		this.restoreCourses(actions);
	}

	getSkillSet() {
    let th = this;
    Request
    .get('/dashboard/skillset')
    .set({'Authorization': localStorage.getItem('token')})
    .end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({skills: res.body});
      }
    });
  }

	addNewSkill(skill) {
    let th = this;
		let skills = this.state.skills;
    Request
    .post('/dashboard/createnewskill')
    .set({'Authorization': localStorage.getItem('token')})
    .send({skill: skill})
    .end(function(err, res) {
      if (err)
        console.log(err);
      else {
        skills.push(skill);
        th.setState({skills: skills});
      }
    });
  }

	getCourses() {
		let th = this;
		Request
			.get('/dashboard/courses')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Successfully fetched all courses', res.body)
		    	th.setState({
		    		courses: res.body
		    	})
		    }
			})
	}

	addCourse(course){
		let th = this;
		let flag = false;
		this.state.courses.filter(function(existingCourse) {
			if(course.ID === existingCourse.ID) {
				flag = true;
			}
		})
		if(!flag) {
			Request
				.post('/dashboard/addcourse')
				.set({'Authorization': localStorage.getItem('token')})
				.send(course)
				.end(function(err, res){
			    if(err)
			    	console.log(err);
			    else {
			    	th.getCourses();
						th.setState({
							open: true,
							message: 'Course Added Successfully'
						})
			    }
			  });
			}
			else {
				th.setState({
					open: true,
					message: 'Course already exists'
				})
			}
	}

	handleRequestClose = () => {
    this.setState({
      open: false,
			message: ''
    });
  };

	updateCourse(course, edit){
		let th = this
		console.log(edit)
		Request
			.post('/dashboard/updatecourse')
			.set({'Authorization': localStorage.getItem('token')})
			.send({course:course,edit:edit})
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.getCourses();
					th.setState({
			      open: true,
						message: 'Course Updated Successfully'
			    });
		    }
		  });
	}

	deleteCourse(course){
		let th = this
		console.log(course)
		Request
			.post('/dashboard/deletecourse')
			.set({'Authorization': localStorage.getItem('token')})
			.send(course)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.getCourses();
					th.setState({
			      open: true,
						message: 'Course Deleted Successfully'
			    });
		    }
		  });
	}

	restoreCourses(actions){
		let th = this
		Request
			.post('/dashboard/restorecourse')
			.set({'Authorization': localStorage.getItem('token')})
			.send(actions)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.getCourses();
					th.setState({
			      open: true,
						message: 'Course Restored Successfully'
			    });
		    }
		  });
	}

	openAssignments() {
		this.setState({
			assignmentsDialog: true
		});
	}

	closeAssignments() {
		this.setState({
			assignmentsDialog: false
		});
	}

	openSchedule() {
		this.setState({
			scheduleDialog: true
		});
	}

	closeSchedule() {
		this.setState({
			scheduleDialog: false
		});
	}

	setCurrentCourse(currentCourse, bgColor, iconColor) {
		this.setState({
			currentCard: {
				course: currentCourse,
				bgColor: bgColor,
				iconColor: iconColor
			}
		});
	}

	subDelete(obj,type) {
		let th = this
		console.log(type)
		Request
			.post('/dashboard/deleteassignmentorschedule')
			.set({'Authorization': localStorage.getItem('token')})
			.send({obj:obj, course:th.state.currentCard.course, type:type})
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
					console.log('coming here')
		    	th.getCourses();
		    }
		  });
	}

	render() {
		let th = this;
		return(
			<div>
				<div>
				<h2 style={styles.heading}>Course Management</h2>
				<AddCourse handleAdd={this.addCourse} skills={this.state.skills}/>
				<SkillSet skills={this.state.skills} addNewSkill={this.addNewSkill}/>
				<Grid style={styles.grid}>
					<Row>
						{
							this.state.courses.map(function (course, key) {
								if(!course.Removed)
								{
									return (
											<Col md={3} key={key} style={styles.col}>
												<CourseCard course={course}
												updateCourse={th.updateCourse}
												deleteCourse={th.deleteCourse}
												bgColor={backgroundColors[key%4]}
												bgIcon={backgroundIcons[key%4]}
												openAssignments={th.openAssignments}
												closeAssignments={th.closeAssignments}
												openSchedule={th.openSchedule}
												closeSchedule={th.closeSchedule}
												setCurrentCourse={()=>{th.setCurrentCourse(course, backgroundColors[key%4], backgroundIcons[key%4])}}
												/>
											</Col>
											)
								}
							})
						}
					</Row>
				</Grid>
			</div>
			<IconButton tooltip="Restore Deleted Course" style = {styles.restore}  onClick={this.openRestoreDialog}>
					      <RestoreIcon/>
			</IconButton>
			 {
							this.state.openDialog &&
							<RestoreCourse course={this.state.courses} openDialog={this.state.openDialog} handleRestore={this.handleRestoreCourse} handleClose={this.closeRestoreDialog}/>
				}
				<Assignments
					bgColor={this.state.currentCard.bgColor || 'white'}
					bgIcon={this.state.currentCard.iconColor || 'white'}
					courseID={this.state.currentCard.course ? this.state.currentCard.course.ID : 'NA'}
					assignments={
						this.state.currentCard.course ?
						this.state.currentCard.course.Assignments.sort(function(a, b) {
							return a.Week.low - b.Week.low
						}) :
						[]
					}
					delete={this.subDelete}
					openDialog={this.state.assignmentsDialog}
					closeDialog={this.closeAssignments} />

					<Schedule
						bgColor={this.state.currentCard.bgColor || 'white'}
						bgIcon={this.state.currentCard.iconColor || 'white'}
						courseID={this.state.currentCard.course ? this.state.currentCard.course.ID : 'NA'}
						sessions={
							this.state.currentCard.course ?
							this.state.currentCard.course.Schedule.sort(function(a, b) {
								return a.Day - b.Day
							}) :
							[]
						}
						delete={this.subDelete}
						openDialog={this.state.scheduleDialog}
						closeDialog={this.closeSchedule} />

				<Snackbar
					open={this.state.open}
					message={this.state.message}
					autoHideDuration={4000}
					onRequestClose={this.handleRequestClose}
			 />
			</div>
		)
	}
}
