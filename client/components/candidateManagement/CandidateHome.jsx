import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardMedia} from 'material-ui/Card';
import {Grid, Row, Col} from 'react-flexbox-grid';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'material-ui/DatePicker';
import {grey50} from 'material-ui/styles/colors';
import Request from 'superagent';
import Moment from 'moment';
import PerformanceMatrix from './PerformanceMatrix.jsx';
import DownloadProfile from './DownloadProfile.jsx';

const styles = {
	back: {
		marginRight: 20
	},
	iconWrapper : {
		float: 'right'
	},
	actionIcon: {
		marginRight: 15,
		cursor: 'pointer'
	},
	name: {
		color: '#fff',
		background: '#555',
		textAlign: 'center',
	},
	pic: {
		padding: 0
	},
	basicDetails: {
		textAlign: 'center',
		marginTop: 10,
		color: '#333',
		lineHeight: 2,
		fontSize: 13
	},
	details: {
		marginTop: -15,
		marginLeft: 50,
		fontSize: 13,
		lineHeight: 1.5
	}
}

export default class CandidateHome extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imageURL: '../../assets/images/avt-default.jpg',
			startDate: '',
			endDate: '',
			showDeleteDialog: false,
			mode: ''
		}
		this.getProfilePic = this.getProfilePic.bind(this);
		this.getWave = this.getWave.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.openDeleteDialog = this.openDeleteDialog.bind(this);
		this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
		this.formatDate = this.formatDate.bind(this);
	}
	componentWillMount() {
		this.getWave(this.props.candidate.Wave)
		this.getProfilePic(this.props.candidate.EmailID)
	}
	getProfilePic(emailID) {
		let th = this;
		let username = emailID.split("@wipro.com")[0];
		Request
			.get(`/dashboard/getimage`)
			.set({'Authorization': localStorage.getItem('token')})
			.query({filename: username})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	if(res.text) {
			    	th.setState({
			    		imageURL: res.text
			    	})
		    	}
		    }
			})
	}
	getWave(waveid) {
		console.log('here');
		console.log(waveid);
		let th = this;
		let wave = waveid.split('(')[0].trim();
    let course = waveid.split('(')[1].split(')')[0];
		Request
			.get(`/dashboard/wave?waveid=${wave}&course=${course}`)
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log(res.body);
		    	th.setState({
						mode: res.body.Mode,
		    		startDate: res.body.StartDate,
		    		endDate: res.body.EndDate
		    	})
		    	console.log('done')
		    }
		  })
	}
	handleBack() {
		this.props.handleBack();
	}
	openDeleteDialog() {
		this.setState({
			showDeleteDialog: true
		})
	}
	closeDeleteDialog() {
		this.setState({
			showDeleteDialog: false
		})
	}
	handleDelete() {
		this.props.handleDelete(this.props.candidate);
	}
	formatDate(date) {
		return Moment(date).format("MMM Do YYYY");
	}

	render() {
		const deleteDialogActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.closeDeleteDialog}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.closeDeleteDialog}
        onClick={this.handleDelete}
      />,
    ];
		return (
			<div>
				<Grid>
					<Row>
						<Col md={2} mdOffset={10}>
							<FlatButton
								label="<< Go Back"
								primary={true}
								onClick={this.handleBack}
							/>
						</Col>
					</Row>
					<div style={styles.container}>
						{
							<Grid>
								<Row>
									<Col md={8} mdOffset={2} style={styles.name}>
										<span>
											<h3>
												{this.props.candidate.EmployeeName}
												<span style={styles.iconWrapper}>
													<DownloadProfile
														color={grey50}
														style={styles.actionIcon}
														candidate={this.props.candidate}
														imageURL={this.state.imageURL}
														role={this.props.role}
														zip={false}
													/>
													<DeleteIcon
														style={styles.actionIcon}
														color={grey50}
														onClick={this.openDeleteDialog}
														imageURL={this.state.imageURL}
													/>
												</span>
											</h3>
										</span>
									</Col>
								</Row>
								<Row>
									<Col md={2} mdOffset={2} style={styles.pic}>
										<CardMedia>
											<img src={this.state.imageURL}/>
										</CardMedia>
										<p style={styles.basicDetails}>
											Employee Id: {this.props.candidate.EmployeeID}<br/>
											Career Band: {this.props.candidate.CareerBand}<br/>
											Email: {this.props.candidate.EmailID}<br/>
											Wave: {this.props.candidate.Wave}
										</p>
									</Col>
									<Col md={6} mdOffset={1}>
										<h4>Personal Details</h4>
										<p style={styles.details}>
											EmailID: {this.props.candidate.EmailID} <br/>
											Alternate EmailID: {this.props.candidate.AltEmail}<br/>
											Contact Number: {this.props.candidate.Contact} </p>
										<h4>Experience</h4>
			 							<p style={styles.details}>
											Work Experience: {this.props.candidate.WorkExperience}
										</p>

										<h4>Digi-Thon</h4>
										<p style={styles.details}>
											Digi-Thon Phase: {this.props.candidate.DigiThonPhase}<br/>
											Digi-Thon Score: {this.props.candidate.DigiThonScore}
										</p>

										{
											this.props.candidate.Remarks != undefined &&
											this.props.candidate.Remarks != '' &&
											<div>
												<h4>Mentor Meet</h4>
												<p style={styles.details}>
													Selected: {this.props.candidate.Selected}<br/>
													Remarks: {this.props.candidate.Remarks}
											</p>
											</div>
										}
										<h4>Training Details</h4>
										<p style={styles.details}>
											Wave: {this.props.candidate.Wave}<br/>
											Mode: {this.state.mode}<br/>
											Start Date: {this.formatDate(this.state.startDate)}<br/>
											End Date: {this.formatDate(this.state.endDate)}
										</p>

										{
											this.props.candidate.AcademyTrainingSkills != undefined &&
											this.props.candidate.AcademyTrainingSkills != '' &&
											<div>
												<h4>Academy Training Skills</h4>
												<p style={styles.details}>
													Skills: {this.props.candidate.AcademyTrainingSkills}
											</p>
											</div>
										}
										{(this.props.candidate.ProjectName !== '' && this.props.candidate.ProjectName !== undefined) &&
										<div>
										<h4>Project Details</h4>
										<p style={styles.details}>
											Project Name: {this.props.candidate.ProjectName}<br/>
											Project Description: {this.props.candidate.ProjectDescription}<br/>
											Project Skills: <ul>{this.props.candidate.ProjectSkills.map(function(skill) {
												return <li>{skill}</li>
											})}</ul>
										</p></div>
										}
										{
											this.props.role == 'wiproadmin' &&
											<div>
												<h4>Billability:</h4>
												<p style={styles.details}><span>Status: {this.props.candidate.Billability.split('since')[0]} </span>
												{
													this.props.candidate.Billability.split('since').length > 1 &&
														<span> since {this.formatDate(this.props.candidate.Billability.split('since')[1])}</span>
												}
												</p>
											</div>
										}
										<h4>Manager Details</h4>
										<p style={styles.details}>
											Primary Supervisor: {this.props.candidate.PrimarySupervisor}<br/>
											Project Supervisor: {this.props.candidate.ProjectSupervisor}
										</p>

									</Col>
								</Row>
							</Grid>
						}
					</div>
				</Grid>
        <Dialog
        	actions={deleteDialogActions}
        	open={this.state.showDeleteDialog}
          onRequestClose={this.closeDeleteDialog}
        >
        	Are you sure you want to delete this candidate?
        </Dialog>
			</div>
		)
	}
}
