import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import Request from 'superagent';

const items = [
  <MenuItem key={1} value={"mentor"} primaryText="Mentor" />,
  <MenuItem key={2} value={"administrator"} primaryText="Administrator" />,
  <MenuItem key={3} value={"sradministrator"} primaryText="Sr. Administrator" />,
  <MenuItem key={4} value={"sponsor"} primaryText="Sponsor" />
];

const styles = {
    addButton: {
      position:'fixed',
      bottom: '60px',
      right: '15px',
      zIndex: 1
    },
  	dialog: {
  		backgroundColor: '#DDDBF1',
  		borderLeft: '10px solid teal',
      borderRight: '10px solid teal',
      borderBottom: '3px solid teal'
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
  	}
};

export default class AddUser extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			open: false,
			name: '',
      nameErrorText: '',
			username: '',
      usernameErrorText: '',
			email: '',
      emailErrorText: '',
			password: '',
      passwordErrorText: '',
			cpassword: '',
      cpasswordErrorText: '',
			role: '',
      roleErrorText: '',
			roles: []
		}

		this.handleOpen = this.handleOpen.bind(this);
	  this.handleClose = this.handleClose.bind(this);
		this.onChangeName = this.onChangeName.bind(this)
		this.onChangeUsername = this.onChangeUsername.bind(this)
		this.onChangeEmail = this.onChangeEmail.bind(this)
		this.onChangePassword = this.onChangePassword.bind(this)
		this.onChangeConfirmPassword = this.onChangeConfirmPassword.bind(this)
		this.onChangeRole = this.onChangeRole.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleUpdate = this.handleUpdate.bind(this)
		this.resetFields = this.resetFields.bind(this)
	}
	componentDidMount() {
		this.setState({
			roles: this.props.roles
		})
		if(this.props.openDialog) {
			this.setState({
				open: true,
				name: this.props.user.name,
				username: this.props.user.username,
				email: this.props.user.email,
				password: this.props.user.password,
				role: this.props.user.role
			})
		}
	}

	handleOpen() {
    this.setState({open: true});
  }

  handleClose(e, action) {
    if(action == 'CLOSE') {
      this.resetFields()
    } else if(action == 'ADD') {
      if(this.validationSuccess()) {
        this.handleSubmit()
      }
    } else if(action == 'EDIT') {
      if(this.validationSuccess()) {
        this.handleUpdate()
      }
    }
  }

	onChangeName(e) {
		this.setState({
      name: e.target.value,
      nameErrorText: ''
    })
	}

	onChangeUsername(e) {
		this.setState({
      username: e.target.value,
      usernameErrorText: ''
    })
	}

	onChangeEmail(e) {
		this.setState({
      email: e.target.value,
      emailErrorText: ''
    })
	}

	onChangePassword(e) {
		this.setState({
      password: e.target.value,
      passwordErrorText: ''
    })
	}

	onChangeConfirmPassword(e) {
		this.setState({
      cpassword: e.target.value,
      cpasswordErrorText: ''
    })
	}

	onChangeRole(event, key, value) {
		this.setState({
      role: value,
      roleErrorText: ''
    })
	}

	resetFields() {
		this.setState({
      open: false,
			name: '',
      nameErrorText: '',
			username: '',
      usernameErrorText: '',
			email: '',
      emailErrorText: '',
			password: '',
      passwordErrorText: '',
			cpassword: '',
      cpasswordErrorText: '',
			role: '',
      roleErrorText: ''
		})
	}

	handleSubmit() {
		let th = this
		let user = {}
		user.name = this.state.name
		user.username = this.state.username
		user.email = this.state.email
		user.password = this.state.password
		user.role = this.state.role
		this.resetFields()
		this.props.addUser(user)
	}

	handleUpdate() {
		let th = this
		let user = {}
		user.name = this.state.name
		user.username = this.state.username
		user.email = this.state.email
		user.password = this.state.password
		user.role = this.state.role
		this.resetFields()
		this.props.handleUpdate(user)
	}

  validationSuccess() {
		let emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/
    let passwordPattern = /[A-z]{1,}/
		if(this.state.name.trim().length == 0) {
			this.setState({
				 nameErrorText: 'This field cannot be empty.'
			})
		} else if(this.state.username.trim().length == 0) {
			this.setState({
				 usernameErrorText: 'This field cannot be empty.'
			})
		} else if(this.state.password.trim().length == 0) {
			this.setState({
				 passwordErrorText: 'This field cannot be empty.'
			})
		} else if(this.state.cpassword != this.state.password) {
			this.setState({
				 cpasswordErrorText: 'Passwords mismatch! Retype correctly for your password confirmation.'
			})
		} else if(this.state.email.trim().length == 0) {
			this.setState({
				 emailErrorText: 'This field cannot be empty.'
			})
		} else if(this.state.roles.length == 0) {
			this.setState({
				 roleErrorText: 'Please choose a role for the user.'
			})
		} else {
			return true
		}
    return false
  }

	render() {
		const style = {
			fontFamily: 'sans-serif',
			margin: 'auto',
			width: '500px'
		}
		let dialogTitle, actions
		if(this.props.openDialog) {
      dialogTitle = 'EDIT USER'
			actions = [
        <FlatButton
	    	 		label='Cancel'
	    	   	style={styles.actionButton}
	    			onTouchTap={(e) => this.handleClose(e, 'CLOSE')}
	    	 	/>,
        <FlatButton
      	 		label='Update User'
      	   	style={styles.actionButton}
      			onTouchTap={(e) => this.handleClose(e, 'EDIT')}
      	 	/>
      ]
		}
		else {
      dialogTitle = 'ADD A NEW USER'
      actions = [
        <FlatButton
	    	 		label='Cancel'
	    	   	style={styles.actionButton}
	    			onTouchTap={(e) => this.handleClose(e, 'CLOSE')}
	    	 	/>,
        <FlatButton
      	 		label='Add User'
      	   	style={styles.actionButton}
      			onTouchTap={(e) => this.handleClose(e, 'ADD')}
      	 	/>
      ]
		}
		return(
			<div>
					<FloatingActionButton style={styles.addButton} mini={true} onTouchTap={this.handleOpen} >
			      <ContentAdd />
			    </FloatingActionButton>
		    <Dialog
          bodyStyle={styles.dialog}
          title={dialogTitle}
          titleStyle={styles.dialogTitle}
          modal={false}
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={(e) => this.handleClose(e, 'CLOSE')}
          actions={actions}
          actionsContainerStyle={styles.actionsContainer}
        >
          <div>
						<TextField
			    		hintText='Display Name'
			    		floatingLabelText='Name'
              errorText={this.state.nameErrorText}
			    		value={this.state.name}
			    		onChange={this.onChangeName}
              style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
			    	/>
			    	<TextField
			    		hintText='Should not be your name'
			    		floatingLabelText='Username'
              errorText={this.state.usernameErrorText}
			    		value={this.state.username}
			    		onChange={this.onChangeUsername}
			    		disabled={this.props.openDialog}
              underlineDisabledStyle={{display: 'none'}}
              style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
			    	/>
          </div>
          <div>
            <TextField
              floatingLabelText="Password"
              hintText="Secure your account"
              type="password"
              errorText={this.state.passwordErrorText}
              value={this.state.password}
              onChange={this.onChangePassword}
              style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
            />
            <TextField
              floatingLabelText="Confirm Password"
              hintText="Confirm password"
              type="password"
              errorText={this.state.cpasswordErrorText}
              value={this.state.cpassword}
              onChange={this.onChangeConfirmPassword}
              style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
            />
          </div>
          <div>
						    	<TextField
						    		hintText="This will be unique"
						    		floatingLabelText="Email"
						    		value={this.state.email}
						    		onChange={this.onChangeEmail}
                    errorText={this.state.emailErrorText}
                    style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px', top: '-22px'}}
						    	/>
						    	<SelectField
                    errorText={this.state.roleErrorText}
						        onChange={this.onChangeRole}
						        floatingLabelText="Select Role"
						        value={this.state.role}
                    style={{width: '50%', border: '2px solid white', boxSizing: 'border-box', padding: '5px'}}
        						menuItemStyle={{borderTop: '1px solid teal', borderBottom: '1px solid teal', backgroundColor: '#DDDBF1'}}
        						listStyle={{backgroundColor: 'teal', borderLeft: '5px solid teal', borderRight: '5px solid teal'}}
        						selectedMenuItemStyle={{color: 'black', fontWeight: 'bold'}}
        						maxHeight={600}
						      >
						        {
						        	this.state.roles.map(function(val, key) {
						        		return <MenuItem key={key} value={val} primaryText={val} />
						        	})
						        }
						      </SelectField>
            </div>
        </Dialog>
			</div>
		)
	}
}

AddUser.contextTypes = {
  router: PropTypes.object.isRequired
};
