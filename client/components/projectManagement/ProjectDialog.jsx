import React from 'react';
import Request from 'superagent'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import AutoComplete from 'material-ui/AutoComplete'
import Paper from 'material-ui/Paper'
import Chip from 'material-ui/Chip'
import Snackbar from 'material-ui/Snackbar'
import AddIcon from 'material-ui/svg-icons/content/add-circle-outline'
import IconButton from 'material-ui/IconButton'
import {Grid, Row, Col} from 'react-flexbox-grid'
import app from '../../styles/app.json';

const styles = {
	addButton: {
		position:'fixed',
	  bottom: '60px',
	  right: '15px',
	  zIndex: 1
	},
	dialog: {
		backgroundColor: '#DDDBF1',
		borderBottom: '3px solid teal',
		borderRight: '10px solid teal',
		borderLeft: '10px solid teal'
	},
	dialogTitle: {
		fontWeight: 'bold',
		backgroundColor: 'teal',
		color: '#DDDBF1',
		textAlign: 'center'
	},
	actionsContainer: {
		backgroundColor: 'teal',
		borderTop: '0px',
		marginTop: '0px'
	},
	actionButton: {
		backgroundColor: '#DDDBF1',
		width: '50%',
		color: 'teal',
		border: '1px solid teal',
		height: '100%'
	},
	underlineDisabled: {
		display: 'none'
	},
	paper: {
		margin: '5px',
		padding: '5px',
		width: 'auto',
		height: '120px',
		borderRadius: '2px'
	},
	wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
	chip: {
    margin: '4px',
    background: '#eee'
  }
}

export default class ProjectDialog extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			showDialog: false,
			waves: [],
			projectName: '',
			versionName: '',
			projectDesc: '',
			candidates:[],
			wave: '',
			searchPerm: '',
			openSnackBar: false,
			snackBarMsg: '',
			sessionOn: {},
			candidateList: [],
			skillName: '',
			skills: [],
			projectNameErrorText: '',
			projectDescErrorText: '',
			waveErrorText: '',
			skillsErrorText: '',
			candidatesName: [] ,
			candidateIDList: [] ,
			candidateDelList: [],
			project: {},
			Course: []
		}
		this.getWaveIDs = this.getWaveIDs.bind(this)
		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleVersionChange = this.handleVersionChange.bind(this);
		this.handleDescChange = this.handleDescChange.bind(this);
		this.handleAdd = this.handleAdd.bind(this);
		this.handleControlDelete = this.handleControlDelete.bind(this);
		this.handleUpdateInputPerm = this.handleUpdateInputPerm.bind(this);
		this.handleAddNewPerm = this.handleAddNewPerm.bind(this);
		this.onWaveChange = this.onWaveChange.bind(this);
		this.onChangeAddSkill = this.onChangeAddSkill.bind(this);
		this.onChangeSkill = this.onChangeSkill.bind(this);
		this.handleSkillDelete = this.handleSkillDelete.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.validationSuccess = this.validationSuccess.bind(this);
		this.handleAddVersion = this.handleAddVersion.bind(this);
	}

	componentWillMount() {
		if(localStorage.getItem('token')) {
			this.getWaveIDs()
		}
		if(this.props.dialogTitle == 'EDIT PRODUCT') {
			let th = this;
			let candidateList = [];
			let candidateIDList = [];
			this.props.project.version[th.props.version].members.map(function(member) {
				candidateList.push(member.EmployeeName)
				candidateIDList.push(member.EmployeeID)
			})
			this.setState({
				project: th.props.project,
				projectName: this.props.project.product,
				versionName: this.props.project.version[th.props.version].name,
				projectDesc: this.props.project.version[th.props.version].description,
				candidateList:candidateList,
				candidateIDList:candidateIDList,
				wave: this.props.project.version[th.props.version].wave,
				skills: this.props.project.version[th.props.version].skills,
				showDialog: this.props.openDialog
			})
			this.getCandidates(this.props.project.version[th.props.version].wave);
		}
		if(this.props.dialogTitle == 'ADD VERSION') {
			this.setState({
				showDialog: this.props.openDialog,
				projectName: this.props.project.product
			})
		}
	}

	getWaveIDs() {
		let th = this
		Request
			.get('/dashboard/waveids')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
				let wave = [];
	      let course = [];
	      res.body.waveids.map(function (waveDetails) {
	        wave.push(waveDetails.waveID);
	        course.push(waveDetails.course);
	      })
	      th.setState({
	        waves: wave,
	        Course: course
	      })
			})
	}

	onWaveChange(e) {
		let th = this
		th.setState({
			wave: e.target.outerText,
			waveErrorText: '',
			candidateList: [],
			candidateIDList: []
		})
		th.getCandidates(e.target.outerText)
	}

	getCandidates(waveID) {
			let th = this
			let candidateList = []
			let candidateName = []
			let candidateID = []
			let wave = waveID.split('(')[0].trim();
	    let course = waveID.split('(')[1].split(')')[0];
	    Request
				.post('/dashboard/cadetsofwave')
				.set({'Authorization': localStorage.getItem('token')})
				.send({waveid: wave, course: course})
				.end(function(err, res){
					res.body.map(function(candidate,index) {
						candidateList.push(candidate)
						candidateName.push(candidate.EmployeeName)
						candidateID.push(candidate.EmployeeID)
					})
					th.setState({
						candidates: candidateList,
						candidatesName: candidateName
					})
				})
	}

	handleControlDelete(perm) {
		console.log(perm,"cntrlDelete")
		let index = this.state.candidateList.indexOf(perm);
		let candidatesID = this.state.candidateIDList.filter(function(id,key){
			return index!=key
		})
		let candidatesLists = this.state.candidateList.filter(function(control) {
			return perm != control
		})
		let candidateDelPerm = this.state.candidateDelList;
		candidateDelPerm.push(this.state.candidateIDList[index]);
		this.setState({
			candidateList: candidatesLists,
			candidateIDList: candidatesID,
			candidateDelList: candidateDelPerm
		})
	}

	handleUpdateInputPerm(searchPerm) {
		this.setState({
			searchPerm: searchPerm
		})
	}

	handleAddNewPerm() {
		let perms = [];
		let th = this;
		if(this.state.candidatesName.indexOf(this.state.searchPerm)> -1
			 && this.state.candidateList.indexOf(this.state.searchPerm) === -1) {
				perms = this.state.candidateList;
				let index = this.state.candidatesName.indexOf(this.state.searchPerm);
				let candidateID = this.state.candidateIDList;
				candidateID.push(this.state.candidates[index].EmployeeID);
				perms.push(this.state.searchPerm);
				let candidateDelList = this.state.candidateDelList.filter(function(control) {
					return th.state.candidates[index].EmployeeID != control
				})
				this.setState({
					candidateList: perms,
					searchPerm: '',
					candidateIDList: candidateID,
					candidateDelList: candidateDelList
				})
		} else {
			if(this.state.candidateList.indexOf(this.state.searchPerm) >= 0) {
				this.setState({
					snackBarMsg: "Candidate already added",
					openSnackBar: true
				})
			} else {
				this.setState({
					snackBarMsg: "Candidate not available",
					openSnackBar: true
				})
			}
		}
	}

	handleOpen() {
		this.setState({
			showDialog: true
		})
	}

	handleClose(e, action) {
		if(action == 'CLOSE') {
			if(this.props.dialogTitle == 'ADD PRODUCT') {
				this.setState({
					showDialog: false,
					projectName: '',
					versionName: '',
					projectDesc: '',
					wave: '',
					projectNameErrorText: '',
					projectDescErrorText: '',
					waveErrorText: '',
					skillsErrorText: '',
					skills: [],
					candidateList: []
				})
			} else if(this.props.dialogTitle == 'EDIT PRODUCT') {
				this.setState({
					showDialog: false,
					projectNameErrorText: '',
					projectVersionErrorText: '',
					projectDescErrorText: '',
					waveErrorText: '',
					skillsErrorText: ''
				})
				this.props.handleClose()
			} else if(this.props.dialogTitle == 'ADD VERSION') {
				this.setState({
					showDialog: false,
					projectName: '',
					versionName: '',
					projectDesc: '',
					wave: '',
					projectNameErrorText: '',
					projectDescErrorText: '',
					waveErrorText: '',
					skillsErrorText: ''
				})
				this.props.handleClose();
			}
		} else if(this.validationSuccess()) {
			if(action == 'ADD') {
				console.log("inside validationsucceshandle")
				this.handleAdd()
			} else if(action == 'EDIT') {
				this.props.handleClose()
				this.handleUpdate()
			} else if(action == 'VERSION') {
				console.log('here')
				this.props.handleClose()
				this.handleAddVersion()
			}
			this.setState({
				showDialog: false
			})
		}
	}

	handleNameChange(e) {
		this.setState({
			projectName: e.target.value,
			projectNameErrorText: ''
		})
	}
	handleVersionChange(e) {
		this.setState({
			versionName: e.target.value,
			projectVersionErrorText: ''
		})

	}

	handleDescChange(e) {
		this.setState({
			projectDesc: e.target.value,
			projectDescErrorText: ''
		})
	}

	handleAdd() {
		 console.log(this.state.candidateList,"candidateList")

			let project = {}
			project.version = []
			project.version.push({})
		  project.version[0].members =[]
			let th = this
			this.state.candidateList.map(function(name, index){
				project.version[0].members.push({EmployeeID:th.state.candidateIDList[index], EmployeeName:name})
			})
			project.product = this.state.projectName;
			project.version[0].name = this.state.versionName;
			project.version[0].description = this.state.projectDesc;
			project.version[0].wave = this.state.wave;
			project.version[0].skills = this.state.skills;
			project.version[0].updated = false;
			project.version[0].addedOn = new Date();
			// project.version[0].addedBy = xyz;
			this.setState({
				projectName: '',
				versionName: '',
				projectDesc: '',
				candidates:[],
				wave: '',
				skills: []
			})
			this.props.addProject(project);
	}

	handleAddVersion() {
			let th = this;
			let product = th.state.projectName;
			let version = {}
		  version.members =[]
			this.state.candidateList.map(function(name, index){
				version.members.push({EmployeeID:th.state.candidateIDList[index],EmployeeName:name})
			})
			version.name= this.state.versionName;
			version.description = this.state.projectDesc;
			version.wave = this.state.wave;
			version.skills = this.state.skills;
			version.updated = true;
			// version.addedOn = new Date();
			// version.addedBy = xyz;
			this.setState({
				projectName: '',
				versionName: '',
				projectDesc: '',
				candidates:[],
				wave: '',
				skills: []
			})
			this.props.handleAddVersion({product: product, version: version});
		}

	onChangeAddSkill() {
		if(this.state.skillName.trim().length != 0) {
			let skills = this.state.skills
			skills.push(this.state.skillName)
			this.setState({
				skills: skills,
				skillName: ''
			})
		} else {
			this.setState({
				skillName: ''
			})
		}
	}

	onChangeSkill(e) {
		this.setState({
			skillName: e.target.value,
			skillsErrorText: ''
		})
	}

	handleSkillDelete(perm) {
		let skill = this.state.skills.filter(function(control) {
			return perm != control
		})
		this.setState({
			skills: skill
		})
	}

	handleUpdate() {
		let th = this;
		let version = this.state.project.version[th.props.version];
		version.members = [];
		this.state.candidateList.map(function(name, index){
			version.members.push({EmployeeName: name, EmployeeID: th.state.candidateIDList[index]})
		})
		version.name = this.state.versionName;
		version.description = this.state.projectDesc;
		version.wave = this.state.wave;
		version.skills = this.state.skills;
		version.addedOn = new Date();
		this.setState({
			projectName: '',
			projectDesc: '',
			candidates:[],
			wave: '',
			skills: []
		})
		this.props.handleUpdate(version);
		this.props.handleClose();
	}

	validationSuccess() {
		if(this.state.projectName.trim().length == 0) {
			this.setState({
				projectNameErrorText: 'This field cannot be empty'
			})
		} else if(this.state.versionName.trim().length == 0) {
			this.setState({
				projectVersionErrorText: 'This field cannot be empty'
			})
		} else if(this.state.wave.length == 0) {
			this.setState({
				waveErrorText: 'This field cannot be empty'
			})
		} else if(this.state.skills.length == 0) {
			this.setState({
				skillsErrorText: 'This list cannot be empty'
			})
		} else if(this.state.projectDesc.trim().length == 0) {
			this.setState({
				projectDescErrorText: 'This field cannot be empty'
			})
		} else {
				return true
		}
		return false
	}

	render() {
		let th = this
		const	AddActions = [
      <FlatButton
        label='Cancel'
        onTouchTap={(e)=>{this.handleClose(e, 'CLOSE')}}
				style={styles.actionButton}
      />,
      <FlatButton
        label='Add'
        onTouchTap={(e)=>{this.handleClose(e, 'ADD')}}
				style={styles.actionButton}
      />
    ]

		const	VersionActions = [
      <FlatButton
        label='Cancel'
        onTouchTap={(e)=>{this.handleClose(e, 'CLOSE')}}
				style={styles.actionButton}
      />,
      <FlatButton
        label='Add'
        onTouchTap={(e)=>{this.handleClose(e, 'VERSION')}}
				style={styles.actionButton}
      />
    ]

    const	EditActions = [
      <FlatButton
        label='Cancel'
        onTouchTap={(e)=>{this.handleClose(e, 'CLOSE')}}
				style={styles.actionButton}

      />,
      <FlatButton
        label='Update'
				onTouchTap={(e)=>{this.handleClose(e, 'EDIT')}}
				style={styles.actionButton}
      />
    ]

		let actions = []
		if(this.props.dialogTitle == 'ADD PRODUCT') actions = AddActions
		else if(this.props.dialogTitle == 'ADD VERSION') actions = VersionActions
		else actions = EditActions

		return(
		<div>
			<FloatingActionButton mini={true} style={app.fab} onTouchTap={this.handleOpen}>
	      <ContentAdd />
	    </FloatingActionButton>
	    <Dialog
	    	bodyStyle={styles.dialog}
        title={this.props.dialogTitle}
				titleStyle={styles.dialogTitle}
        actions={actions}
				actionsContainerStyle={styles.actionsContainer}
        open={this.state.showDialog}
        autoScrollBodyContent={true}
      >
				<div>
				 <TextField
			      floatingLabelText='Name *'
						floatingLabelStyle={app.mandatoryField}
						value={this.state.projectName}
			      onChange={this.handleNameChange}
						errorText={this.state.projectNameErrorText}
						disabled={this.props.openDialog}
						underlineDisabledStyle={styles.underlineDisabled}
						style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px', top:'-22px'}}
			    />
					<br/>
					<TextField
					floatingLabelText='Version *'
					floatingLabelStyle={app.mandatoryField}
					value={this.state.versionName}
					onChange={this.handleVersionChange}
					errorText={this.state.projectVersionErrorText}
					disabled={this.props.showAddVersion}
					underlineDisabledStyle={styles.underlineDisabled}
					style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px', top:'-22px'}}
				/>
					 <SelectField
							onChange={th.onWaveChange}
							errorText={this.state.waveErrorText}
							floatingLabelText='Wave *'
							floatingLabelStyle={app.mandatoryField}
							value={th.state.wave}
							style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
						>
							{
								th.state.waves.map(function(val, key) {
									return <MenuItem key={key} value={val + ' (' + th.state.Course[key] + ')'} primaryText={val + ' (' + th.state.Course[key] + ')'} />
								})
							}
					</SelectField>
				</div>
				<div style={{marginTop: '-25px'}}>
					<div style={{border: '2px solid white', width: '50%', display: 'inline-block', boxSizing: 'border-box'}}>
					<AutoComplete
					      floatingLabelText='Select Candidates...'
					      filter={AutoComplete.fuzzyFilter}
					      searchText={this.state.searchPerm}
			          onUpdateInput={this.handleUpdateInputPerm}
			          onNewRequest={this.handleAddNewPerm}
					      dataSource={this.state.candidatesName}
					      maxSearchResults={5}
								style={{padding: '5px'}}
					    />
		    	<Paper style={styles.paper} zDepth={1} >
						<div style={styles.wrapper}>
							{
								th.state.candidateList.map(function (candidate, index) {
									return(
										<Chip
											onRequestDelete={() => th.handleControlDelete(candidate)}
						          style={styles.chip}
						          key={index}
						        >
						          <span style={styles.chipName}>{candidate}</span>
						        </Chip>
					        )
								})
							}
						</div>
					</Paper>
					</div>
					<div style={{border: '2px solid white', width: '50%', display: 'inline-block', boxSizing: 'border-box'}}>
					<TextField
			    		hintText="Skills"
			    		floatingLabelText="Skills *"
							floatingLabelStyle={app.mandatoryField}
			    		value={this.state.skillName}
							errorText={this.state.skillsErrorText}
			    		onChange={this.onChangeSkill}
							style={{padding: '5px'}}
			    	/>
			    	<IconButton tooltip="Add Skill" onClick={this.onChangeAddSkill}>
				      <AddIcon/>
				    </IconButton>
						<Paper style={styles.paper} zDepth={1} >
							<div style={styles.wrapper}>
								{
									this.state.skills.map(function (skill, index) {
										return(
											<Chip
												onRequestDelete={() => th.handleSkillDelete(skill)}
							          style={styles.chip}
							          key={index}
							        >
							          <span style={styles.chipName}>{skill}</span>
							        </Chip>
						        )
									})
								}
							</div>
						</Paper>
						</div>
					</div>
					<div>
		      	<TextField
				      floatingLabelText='Description *'
							floatingLabelStyle={app.mandatoryField}
				      value={this.state.projectDesc}
				      onChange={this.handleDescChange}
							errorText={this.state.projectDescErrorText}
				      multiLine={true}
				      rows={3}
				      rowsMax={3}
				      fullWidth={true}
							style={{border: '2px solid white', padding: '5px', textAlign: 'justify', boxSizing: 'border-box'}}
				    />
					</div>
      </Dialog>
		</div>)
	}
}
