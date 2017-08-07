import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import app from '../../styles/app.json';
import dialog from '../../styles/dialog.json';
import select from '../../styles/select.json';
import CONFIG from '../../config';

export default class AddWave extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			cadets: [],
			courses: [],
			Mode: '',
			ModeErrorText: '',
			Course: '',
			CourseErrorText:'',
			WaveNumber: '',
			WaveNumberErrorText: '',
			Location: '',
			StartDate: null,
			EndDate: null,
			selectedCadets: [],
			disableCourse: true,
			disableAll: true
		}
		this.handleOpen = this.handleOpen.bind(this)
		this.handleClose = this.handleClose.bind(this)
		this.handleCourseChange = this.handleCourseChange.bind(this)
		this.handleModeChange = this.handleModeChange.bind(this)
		this.handleWaveNumberChange = this.handleWaveNumberChange.bind(this)
		this.handleLocationChange = this.handleLocationChange.bind(this)
		this.handleStartDateChange = this.handleStartDateChange.bind(this)
		this.handleEndDateChange = this.handleEndDateChange.bind(this)
		this.handleCadetsChange = this.handleCadetsChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.validationSuccess = this.validationSuccess.bind(this)
		this.resetFields = this.resetFields.bind(this)
	}

	componentWillMount() {
		this.setState({
			cadets: this.props.cadets,
			courses: this.props.courses
		})
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			cadets: this.props.cadets,
			courses: this.props.courses
		})
	}

	handleOpen() {
		this.setState({
			open: true
		})
	}

	handleClose(e, action) {
		if(action == 'CLOSE') {
			this.resetFields()
		} else if(action == 'ADD'){
			if(this.validationSuccess()) {
				this.handleSubmit()
			}
		}
	}

	handleModeChange(event, key, val) {
		this.setState({
			Mode: val,
			disableCourse: false,
			ModeErrorText: ''
		})
	}

	handleCourseChange(event, key, val) {
		this.setState({
			Course: val,
			disableAll: false,
			CourseErrorText: ''
		})
	}

	handleWaveNumberChange(event) {
		this.setState({
			WaveNumber: event.target.value,
			WaveNumberErrorText: ''
		})
	}

	handleLocationChange(event, key, val) {
		this.setState({
			Location: val
		})
	}

	handleStartDateChange(event, date) {
		let th = this;
		let dur = 0;
		let startDate = new Date(date);
		this.state.courses.map(function (course, i) {
			if(course.ID == th.state.Course) {
				dur = course.Duration.low
			}
		})
		let endDate = new Date(date.setDate(date.getDate() + dur*7));
		this.setState({
			StartDate: startDate,
			EndDate: endDate
		})
	}

	handleEndDateChange(event, date) {
		this.setState({
			EndDate: date
		})
	}

	handleCadetsChange(event, key, val) {
		this.setState({
			selectedCadets: val
		})
	}

	handleSubmit() {
		let wave = {}
		let th = this;
		wave.WaveID = this.state.Mode.substr(0, 1) + this.state.WaveNumber.split('-')[1];
		wave.Mode = this.state.Mode;
		wave.Course = this.state.Course;
		wave.WaveNumber = this.state.WaveNumber
		wave.Location = this.state.Location
		wave.StartDate = this.state.StartDate
		wave.EndDate = this.state.EndDate
		wave.Cadets = this.state.selectedCadets
		this.props.handleWaveAdd(wave)
		this.resetFields()
	}

	resetFields() {
		this.setState({
			open: false,
			Mode: '',
			Course: '',
			WaveID: '',
			WaveNumber: '',
			WaveNumberErrorText: '',
			Location: '',
			StartDate: null,
			EndDate: null,
			selectedCadets: [],
		})
	}

	validationSuccess() {
		let wavePattern = /[A-z]{4}-[0-9]{1,}/
		if(this.state.Mode.length == 0) {
			this.setState({
				ModeErrorText: 'Please select one mode'
			})
		}
		else if(this.state.Course.length == 0) {
			this.setState({
				CourseErrorText: 'Please select one course'
			})
		}
		else if(this.state.WaveNumber.trim().length == 0) {
			this.setState({
				WaveNumberErrorText: 'This field cannot be empty.'
			})
		}
		else if(!wavePattern.test(this.state.WaveNumber.trim())) {
			this.setState({
				WaveNumberErrorText: 'Invalid Wave Name! Valid Example: Wave-1.'
			})
		}
		else {
			return true
		}
		return false
	}

	render() {
		let th = this;
		const dialogActions = [
      <FlatButton
        label="Cancel"
        style={dialog.actionButton}
        onTouchTap={(e) => this.handleClose(e, 'CLOSE')}
      />,
      <FlatButton
        label="Add"
				style={dialog.actionButton}
        onTouchTap={(e) => this.handleClose(e, 'ADD')}
      />
    ];
		return(
			<div>
				<Dialog
					bodyStyle={dialog.body}
          title="ADD A NEW WAVE"
					titleStyle={dialog.title}
          actions={dialogActions}
					actionsContainerStyle={dialog.actionsContainer}
          modal={false}
          open={this.state.open}
          onRequestClose={(e) => this.handleClose(e, 'CLOSE')}
          autoScrollBodyContent={true}
        >
				<div>
					<div style={dialog.box50}>
						<SelectField
		          floatingLabelText="Mode"
		          value={this.state.Mode}
		          onChange={this.handleModeChange}
		          errorText={this.state.ModeErrorText}
		        >
		        	{
		        		CONFIG.MODES.map(function(mode, i) {
		        			return <MenuItem value={mode} primaryText={mode} key={i}/>
		        		})
		        	}
		        </SelectField>
					</div>
					<div style={dialog.box50}>
						<SelectField
							hintText="Select Courses"
		          floatingLabelText="Course"
		          value={this.state.Course}
		          onChange={this.handleCourseChange}
							style={{width: '100%'}}
							disabled={this.state.disableCourse}
							errorText={this.state.CourseErrorText}
		        >
		        	{
		        		this.state.courses.map(function(course, i) {
		        			if(th.state.Mode == course.Mode)
		        				return <MenuItem key={i} value={course.ID} primaryText={course.ID}/>
		        		})
		        	}
		        </SelectField>
					</div>
				</div>
				<div>
					<div style={dialog.box50}>
						<TextField
							hintText="Provide a number to the wave"
							floatingLabelText="Wave Number"
							value={this.state.WaveNumber}
							onChange={this.handleWaveNumberChange}
							disabled={this.state.disableAll}
							errorText={this.state.WaveNumberErrorText}
						/>
					</div>
					<div style={dialog.box50}>
				    <SelectField
				      hintText="Provide the base location"
				      floatingLabelText="Location"
				      value={this.state.Location}
				      onChange={this.handleLocationChange}
				      fullWidth={true}
				      disabled={this.state.disableAll}
				    >
				    	{
				    		CONFIG.LOCATIONS.map(function (loc, i) {
				    			return <MenuItem key={i} value={loc} primaryText={loc}/>
				    		})
				    	}
				    </SelectField>
					</div>
				</div>
				<div>
					<div style={dialog.box50}>
			    <DatePicker
			    	hintText="Start Date"
						floatingLabelText='Start Date'
			    	value={this.state.StartDate}
			    	onChange={this.handleStartDateChange}
			    	disabled={this.state.disableAll}
			    />
					</div>
					<div style={dialog.box50}>
			    <DatePicker
			    	hintText="End Date"
						floatingLabelText='End Date'
			    	value={this.state.EndDate}
			    	onChange={this.handleEndDateChange}
			    	disabled={this.state.disableAll}
			    />
					</div>
				</div>
				<div style={dialog.box100}>
			    <SelectField
		        multiple={true}
		        hintText="Select Cadets"
						floatingLabelText='Cadets'
		        value={this.state.selectedCadets}
		        onChange={this.handleCadetsChange}
						menuItemStyle={select.menu}
						listStyle={select.list}
						style={{width: '100%'}}
						selectedMenuItemStyle={select.selectedMenu}
						maxHeight={600}
						disabled={this.state.disableAll}
		      >
		        {
		        	this.state.cadets.map(function(cadet, i) {
		        		return (
		        			(cadet.Selected == 'Yes' ||
									cadet.Selected == 'DS') &&
		        			<MenuItem
						        key={i}
						        insetChildren={true}
						        checked={
						        	th.state.selectedCadets &&
						        	th.state.selectedCadets.includes(cadet.EmployeeID)
						       	}
						        value={cadet.EmployeeID}
						        primaryText={`${cadet.EmployeeName} (${cadet.EmployeeID})`}
						      />
		        		)
		        	})
		        }
		      </SelectField>
				</div>
        </Dialog>
				<FloatingActionButton mini={true} style={app.fab} onTouchTap={this.handleOpen} >
		      <ContentAdd />
		    </FloatingActionButton>
			</div>
		)
	}
}
