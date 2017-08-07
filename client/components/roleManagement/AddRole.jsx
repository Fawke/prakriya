import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {Grid, Row, Col} from 'react-flexbox-grid';
import app from '../../styles/app.json';
import dialog from '../../styles/dialog.json';

const styles = {
	accessControlsNoError: {

	},
	accessControlsError: {
		color: 'red'
	}
};

let wiproadminControls = ['Candidates', 'Bulk Upload'];
let sradminControls = [
	'Waves', 'Candidates', 'Mentor Connect', 'Attendance'
];
let mentorControls = [
	'Projects', 'Courses', 'Assessment Tracker', 'Evaluation Forms',
	'Mentor Connect', 'Program Flow'
];
let candidateControls = ['My Profile', 'Attendace', 'Feedback'];

export default class AddRole extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
	    open: false,
	    role:'',
			roleErrorText: '',
			controls: [],
	    actions: [],
			accessControlsText: 'Access Controls',
			accessControlsStyle: styles.accessControlsNoError
	  }
	  this.handleOpen = this.handleOpen.bind(this);
	  this.handleClose = this.handleClose.bind(this);
	  this.onChangeRole = this.onChangeRole.bind(this);
	  this.onChangeActions = this.onChangeActions.bind(this);
	  this.handleSubmit = this.handleSubmit.bind(this);
	  this.setRecommendedControls = this.setRecommendedControls.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		let controls = nextProps.controls;
		controls.map(function(control) {
			control.checked = false
		});
		this.setState({
			controls: controls
		});
	}

	handleOpen() {
    this.setState({open: true});
  }

  handleClose(e, action) {
		if(action == 'CLOSE') {
				this.setState({
					open: false,
					role: '',
					roleErrorText: '',
					accessControlsText: 'Access Controls',
					accessControlsStyle: styles.accessControlsNoError
				})
		} else if(action == 'ADD') {
			if(this.validationSuccess()) {
				this.handleSubmit()
				this.setState({
					open: false,
					roleErrorText: '',
					accessControlsText: 'Access Controls',
					accessControlsStyle: styles.accessControlsNoError
				})
			}
		}
  }

  onChangeRole(e) {
		this.setRecommendedControls(e.target.value.toLowerCase());
  	this.setState({
  		role: e.target.value,
			roleErrorText: ''
  	});
  }

  onChangeActions(event, isChecked) {
		event.persist();
		let val = event.target.value;
		let actionList = this.state.actions;
		let controls = this.state.controls;
		controls.some(function(control) {
			if(control.name == val) control.checked = isChecked;
			return control.name == val;
		});
		if(isChecked) {
			actionList.push(event.target.value)
		} else {
			actionList = this.state.actions.filter(function(item) {
				return item != event.target.value;
			})
		}
		this.setState({
			controls: controls,
			actions: actionList,
			accessControlsText: 'Access Controls',
			accessControlsStyle: styles.accessControlsNoError
		})
	}

	handleSubmit() {
		let th = this
		let roleObj = {}
		let controlsCode = []
		this.props.controls.map(function (control, key) {
			if(th.state.actions.indexOf(control.name) >= 0)
				controlsCode.push(control.code)
		})
		roleObj.name = this.state.role.toLowerCase();
		roleObj.controls = controlsCode
		this.setState({
			actions: []
		})
		this.props.addRole(roleObj)
	}

	validationSuccess() {
		if(this.state.role.trim().length == 0) {
			this.setState({
				roleErrorText: 'This field cannot be empty'
			})
		} else if(this.state.actions.length == 0) {
			this.setState({
				accessControlsStyle: styles.accessControlsError,
				accessControlsText: 'Choose atleast one access control'
			})
		} else {
			return true
		}
		return false
	}

	setRecommendedControls(role) {

		let controls = this.state.controls;
		let actions = this.state.actions;

		controls.map(function(control) {
			if(role == 'mentor') {
				if(mentorControls.indexOf(control.name) > -1) {
					control.checked = true;
					actions.push(control.name);
				}
			} else if(role == 'wiproadmin') {
				if(wiproadminControls.indexOf(control.name) > -1) {
					control.checked = true;
					actions.push(control.name);
				}
			} else if(role == 'sradmin') {
				if(sradminControls.indexOf(control.name) > -1) {
					control.checked = true;
					actions.push(control.name);
				}
			} else if(role == 'candidate') {
				if(candidateControls.indexOf(control.name) > -1) {
					control.checked = true;
					actions.push(control.name);
				}
			}
		})
	}

	render() {
		let th = this
		const dialogActions = [
      <FlatButton
        label='Cancel'
        onTouchTap={(e)=>{this.handleClose(e, 'CLOSE')}}
				style={dialog.actionButton}
      />,
      <FlatButton
        label='Add'
        onTouchTap={(e)=>{this.handleClose(e, 'ADD')}}
				style={dialog.actionButton}
      />,
    ]

		return (
			<div>
				<FloatingActionButton mini={true} style={app.fab} onTouchTap={this.handleOpen} >
		      <ContentAdd />
		    </FloatingActionButton>
		    <Dialog
					bodyStyle={dialog.body}
          title='ADD A NEW ROLE'
					titleStyle={dialog.title}
          actions={dialogActions}
          modal={false}
          open={this.state.open}
          onRequestClose={(e)=>{this.handleClose(e, 'CLOSE')}}
          autoScrollBodyContent={true}
					actionsContainerStyle={dialog.actionsContainer}
        >
          <TextField
          	floatingLabelText='Role *'
						floatingLabelStyle={app.mandatoryField}
						hintText='Name a new role'
						errorText={this.state.roleErrorText}
          	onChange={this.onChangeRole}
						style={{width: '100%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
          />
					<div style={{border: '2px solid white', padding: '5px', textAlign: 'justify', boxSizing: 'border-box'}}>
          <p style={this.state.accessControlsStyle}>{this.state.accessControlsText}</p>
          {
          	this.state.controls.map(function(control, index) {
          		return(
	          		<Checkbox
									label={control.name}
									value={control.name}
									onCheck={th.onChangeActions}
									checked={control.checked}
									key={index}
									style={{width: '30%', display: 'inline-block'}}
								/>
							)
          	})
					}
					</div>
        </Dialog>
			</div>
		);
	}
}
