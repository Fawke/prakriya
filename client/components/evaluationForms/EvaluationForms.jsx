import React from 'react';
import StarRating from 'react-stars';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import SelectField from 'material-ui/SelectField';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import CONFIG from '../../config/index';

const styles = {
	heading: {
		textAlign: 'center'
	},
	selectors: {
		marginBottom: 20
	},
	row: {
		marginTop: 10
	},
	single: {
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 14
	},
	submit: {
		textAlign: 'center',
		marginBottom: 20
	}
}

const EVALUATION = CONFIG.EVALUATION;

export default class EvaluationForms extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cadets: [],
			waveList: [],
			wave: '',
			cadetID: '',
			cadetName: '',
			attitude: 0,
			punctuality: 0,
			programming: [],
			codequality: [],
			testability: [],
			engineeringculture: [],
			skills: [],
			communication: [],
			overall: '',
			doneWell: '',
			improvement: '',
			suggestions: '',
			open: false,
			disableSave: true,
			oldEvaluation: false
		}
		this.getCadets = this.getCadets.bind(this);
		this.handleOverallRatingChange = this.handleOverallRatingChange.bind(this);
		this.handleWaveChange = this.handleWaveChange.bind(this);
		this.handleCandidateChange = this.handleCandidateChange.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleDoneWellChange = this.handleDoneWellChange.bind(this);
		this.handleAreasOfImprovementChange = this.handleAreasOfImprovementChange.bind(this);
		this.handleSuggestionsChange = this.handleSuggestionsChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.saveEvaluation = this.saveEvaluation.bind(this);
		this.getEvaluationFields = this.getEvaluationFields.bind(this);
		this.saveRatingsInNeo4j = this.saveRatingsInNeo4j.bind(this);
	}

	componentWillMount() {
		this.getCadets();
	}

	componentWillUpdate(nextProps, nextState) {
		nextState.disableSave = !(
			nextState.wave.trim() != '' &&
			nextState.cadetName.trim() != '' &&
			nextState.doneWell.trim() != '' &&
			nextState.improvement.trim() != ''
		)
	};

	getCadets() {
		let th = this;
		Request
			.get('/dashboard/cadetsandwave')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	let waves = [];
		    	res.body.map(function (cadet, index) {
		    		if(waves.indexOf(cadet.Wave) < 0)
		    			waves.push(cadet.Wave);
		    	})
		    	th.setState({
		    		cadets: res.body,
		    		waveList: waves
		    	})
		    }
		  })
	};

	getEvaluationFields(candidateID) {
		let th = this;
		console.log('should get evaluation fields for ', candidateID);
		Request
			.get('/dashboard/evaluationfields')
			.set({'Authorization': localStorage.getItem('token')})
			.query({candidateID: candidateID})
			.end(function(err, res){
				if(err)
					console.log('Error in fetching evaluation fields: ', err)
				else {
					// configuring the candidate specific evaluation skills
					console.log('data recieved: ', res.body)
          EVALUATION[4].options = res.body;
          let skills = [];
          res.body.map(function() {
            skills.push(0)
          });
          th.setState({
            skills: skills
          });
				}
			});
	};

	handleWaveChange(event, key, val) {
		this.setState({
			wave: val
		})
	};

	handleOverallRatingChange(event, key, val) {
		this.setState({
			overall: val
		})
	};

	handleCandidateChange(event, key, val) {
		let newVal = val.split('-');
		let th= this;
		Request.get(`/dashboard/getevaluation?emailID=${newVal[1]}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
				console.log('Feedback saved successfully', res.body);
				if(res.body.length > 0)
				{
					th.setState({
						cadetID: res.body[0].cadetID,
						cadetName: res.body[0].cadetName,
						attitude: res.body[0].attitude,
						punctuality: res.body[0].punctuality,
						programming: res.body[0].programming,
						codequality: res.body[0].codequality,
						testability: res.body[0].testability,
						engineeringculture: res.body[0].engineeringculture,
						skills: res.body[0].skills,
						communication: res.body[0].communication,
						overall: res.body[0].overall,
						doneWell: res.body[0].doneWell,
						improvement: res.body[0].improvement,
						suggestions: res.body[0].suggestions,
						oldEvaluation: true,
						disableSave: true
					})
				}
				else {
					th.getEvaluationFields(newVal[1]);
					th.setState({
						cadetName: newVal[0],
						cadetID: newVal[1],
						programming: [0, 0, 0, 0, 0],
						codequality: [0, 0, 0, 0],
						testability: [0, 0, 0],
						engineeringculture: [0, 0, 0, 0, 0],
						communication: [0, 0, 0],
						attitude: 0,
						punctuality: 0,
						overall: '',
						doneWell: '',
						improvement: '',
						suggestions: '',
						oldEvaluation: false
					})
				}
			}
		})
	};

	handleChange(val, type, key) {
		if(type == 'attitude') {
			this.setState({
				attitude: val
			})
		}
		else if(type == 'punctuality') {
			this.setState({
				punctuality: val
			})
		}
		else {
			let temp = this.state[type];
			temp[key] = val;
			this.setState({
				[type]: temp
			})
		}
	};

	handleDoneWellChange(event) {
		this.setState({
			doneWell: event.target.value
		})
	};

	handleAreasOfImprovementChange(event) {
		this.setState({
			improvement: event.target.value
		})
	};

	handleSuggestionsChange(event) {
		this.setState({
			suggestions: event.target.value
		})
	};

	handleSubmit() {
		let evaluationObj = {}
		evaluationObj.cadetID = this.state.cadetID;
		evaluationObj.cadetName = this.state.cadetName;
		evaluationObj.attitude = this.state.attitude;
		evaluationObj.punctuality = this.state.punctuality;
		evaluationObj.programming = this.state.programming;
		evaluationObj.codequality = this.state.codequality;
		evaluationObj.testability = this.state.testability;
		evaluationObj.engineeringculture = this.state.engineeringculture;
		evaluationObj.skills = this.state.skills;
		evaluationObj.communication = this.state.communication;
		evaluationObj.overall = this.state.overall;
		evaluationObj.doneWell = this.state.doneWell;
		evaluationObj.improvement = this.state.improvement;
		evaluationObj.suggestions = this.state.suggestions;
		console.log('Evaluation Obj', evaluationObj);
		this.saveEvaluation(evaluationObj);
	};

  // saving evaluation results in mongodb
	saveEvaluation(evaluationObj) {
		let th = this;
		Request
			.post('/dashboard/saveevaluation')
			.set({'Authorization': localStorage.getItem('token')})
			.send(evaluationObj)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Cadet evaluation form saved successfully', res.body);
					th.saveRatingsInNeo4j();
		    }
		  });
	};

	// updating skill ratings in neo4j
	saveRatingsInNeo4j() {
		let th = this;
		let skillNames = EVALUATION[4].options;
		let skillRatings = this.state.skills;
		let obj = {};
		obj.emailID = this.state.cadetID;
		obj.waveID = this.state.wave;
		obj.skills = skillNames;
		obj.ratings = skillRatings;
		Request
			.post('/dashboard/updaterating')
			.set({'Authorization': localStorage.getItem('token')})
			.send(obj)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Rating updated successfully', res.body);
					th.setState({
						open: true
					});
		    }
		  });
	};

	render() {
		let th = this;
		return(
			<div>
				<h1 style={styles.heading}>StackRoute - Cadet Evaluation</h1>
				<Grid>
					<Row style={styles.selectors}>
						<Col md={4} mdOffset={2}>
							<SelectField
			          value={this.state.wave}
			          onChange={this.handleWaveChange}
			          floatingLabelText="Select Wave"
			          fullWidth={true}
			        >
			        	{
			        		this.state.waveList.map(function (wave, index) {
			        			return <MenuItem key={index} value={wave} primaryText={wave} />
			        		})
			        	}
		        	</SelectField>
						</Col>
						<Col md={4}>
							<SelectField
			          value={this.state.cadetName+'-'+this.state.cadetID}
			          onChange={this.handleCandidateChange}
			          floatingLabelText="Select Candidate"
			          fullWidth={true}
			          disabled={this.state.wave == ''}
			        >
			        {
			        	this.state.cadets.map(function (cadet, index) {
			        		return (
			        			cadet.Wave == th.state.wave &&
			        			<MenuItem
			        				key={index}
			        				value={cadet.EmployeeName+'-'+cadet.EmailID}
			        				primaryText={cadet.EmployeeName+'-'+cadet.EmailID}
			        			/>
			        		)
			        	})
			        }
			        </SelectField>
						</Col>
					</Row>
					<Row><Col md={10}>
						{
							th.state.oldEvaluation && <p style={{color: '#00BCD4', marginLeft: '50%'}}> You have already evaluated this cadet...</p>
						}
					</Col></Row>
					{
						th.state.cadetID == '' ?
						<Row>
							<Col md={8}  mdOffset={2} style={styles.single}>
								<center>Please select a wave and a candidate to proceed.</center>
							</Col>
						</Row> :
						<div>
						<Row>
							<Col md={6} mdOffset={2} style={styles.single}>
								Attitude – Interest, inclination and involvement
							</Col>
							<Col md={2}>
								<StarRating
									color1={'#ddd'}
									half={false}
									size={30}
									value={this.state.attitude}
									onChange={(newVal) => th.handleChange(newVal, 'attitude')}
								/>
							</Col>
						</Row>

						<Row>
							<Col md={6} mdOffset={2} style={styles.single}>
								Punctuality and attendance
							</Col>
							<Col md={2}>
								<StarRating
									color1={'#ddd'}
									half={false}
									size={30}
									value={this.state.punctuality}
									onChange={(newVal) => th.handleChange(newVal, 'punctuality')}
								/>
							</Col>
						</Row>
						{
							EVALUATION.map(function (item, key) {
								return (
									<div key={key}>
										<Row>
											<Col md={8} mdOffset={2}>
												<h3>{item.type.toUpperCase()}</h3>
											</Col>
										</Row>
										{
											item.options.map(function (option, index) {
												return (
													<Row key={index}>
														<Col md ={6} mdOffset={2} style={styles.row}>
															{index+1}. {option}
														</Col>
														<Col md={2}>
															<StarRating
																color1={'#ddd'}
																half={false}
																size={30}
																value={th.state[item.type.replace(' ', '')][index]}
																onChange={(newVal) => th.handleChange(newVal, item.type.replace(' ', ''), index)}
															/>
														</Col>
													</Row>
												)
											})
										}
									</div>
								)
							})
						}
						<br />
						<Row>
							<Col md={6} mdOffset={2} style={styles.single}>
								OVERALL RATING ACROSS THE PROGRAM
							</Col>
							<Col md={2}>
							<SelectField
								value={this.state.overall}
								onChange={this.handleOverallRatingChange}
								fullWidth={true}
								disabled= {this.state.oldEvaluation}
							>
								{
									['Top Gun', 'Good', 'Above Average', 'Average']
									.map(function (value, index) {
										return <MenuItem key={index} value={value} primaryText={value} />
									})
								}
							</SelectField>
							</Col>
						</Row>

						<Row>
							<Col md={8} mdOffset={2}>
								<TextField
						      floatingLabelText="Atleast two areas the participant has done well"
						      multiLine={true}
						      rows={3}
						      rowsMax={3}
						      fullWidth={true}
						      value={this.state.doneWell}
						      onChange={this.handleDoneWellChange}
									disabled= {this.state.oldEvaluation}
						    />
							</Col>
						</Row>

						<Row>
							<Col md={8} mdOffset={2}>
								<TextField
						      floatingLabelText="At least two areas of improvement"
						      multiLine={true}
						      rows={3}
						      rowsMax={3}
						      fullWidth={true}
						      value={this.state.improvement}
						      onChange={this.handleAreasOfImprovementChange}
									disabled= {this.state.oldEvaluation}
						    />
						  </Col>
						</Row>
						<Row>
							<Col md={8} mdOffset={2}>
								<TextField
									floatingLabelText="Suggestions"
									multiLine={true}
									rows={3}
									rowsMax={3}
									fullWidth={true}
									value={this.state.suggestions}
									onChange={this.handleSuggestionsChange}
									disabled= {this.state.oldEvaluation}
								/>
							</Col>
						</Row>

						<Row>
							<Col md={8} mdOffset={2} style={styles.submit}>
								<RaisedButton
									label="Submit"
									primary={true}
									onClick={this.handleSubmit}
									disabled={this.state.disableSave || this.state.oldEvaluation}
									style={{width: '100%'}}
								/>
								<Snackbar
									open={this.state.open}
	          			message="Cadet evaluation form submitted"
									autoHideDuration={2000}
	        			/>
							</Col>
						</Row>
						</div>
					}
				</Grid>
			</div>
		)
	}
}
