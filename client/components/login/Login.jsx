import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Request from 'superagent';
import {Link} from 'react-router';
import AppBar from 'material-ui/AppBar';
import Footer from '../../views/Footer.jsx';
import {Card, CardMedia, CardText} from 'material-ui/Card';
import VisibilityIcon from 'material-ui/svg-icons/action/visibility';
import VisibilityOffIcon from 'material-ui/svg-icons/action/visibility-off';

const styles = {
	body: {
		borderRadius: 10,
	},
	card: {
		background: 'rgba(255,255,255,0.15)',
	}
}

export default class Login extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			passwordType: "password",
			username: "",
			password: "",
			errMsg: "",
			usernameErrorText: "",
			passwordErrorText: ""
		}
		this.onChangeUsername = this.onChangeUsername.bind(this)
		this.onChangePassword = this.onChangePassword.bind(this)
		this.login = this.login.bind(this)
		this.toggleShowPassword = this.toggleShowPassword.bind(this)
	}

	onChangeUsername(e) {
		this.setState({
			errMsg: "",
			usernameErrorText: "",
			username: e.target.value
		})
	}

	onChangePassword(e) {
		this.setState({
			errMsg: "",
			passwordErrorText: "",
			password: e.target.value
		})
	}
	onSubmit(e){
	 	this.onCommentSubmit(e)
	} ;

	login() {
		let th = this
		if(th.state.username.trim().length === 0) th.setState({
			usernameErrorText: "This field cannot be empty"
		})
		if(th.state.password.trim().length === 0) th.setState({
			passwordErrorText: "This field cannot be empty"
		})
		if(th.state.username.trim().length !== 0 && th.state.password.trim().length !== 0) {
			Request
				.post('/login')
				.send({username: this.state.username, password: this.state.password})
				.end(function(err, res){
			    // Do something
			    if(res.status == 401) {
			    	th.setState({
			    		errMsg: "Invalid username or password. Try again."
			    	})
			    }
			    else if(res.text == 'Account suspended') {
			    	th.setState({
			    		errMsg: "Account is suspended. Contact admin."
			    	})
			    }
			    else if(err) {
			    	th.setState({
			    		errMsg: "Internal Server Error."
			    	})
			    }
			    else {
			    	localStorage.setItem('token', res.body.token);
			    	localStorage.setItem('lastLogin', Date.now());
			    	th.context.router.push('/app')
			    }
			  })
		}
	}

	toggleShowPassword() {
		let passwordType = this.state.passwordType == 'password' ? 'text' : 'password';
		this.setState({
			passwordType: passwordType
		})
	}

	render() {

		return(
			<div style={styles.body}>
				<Card style={styles.card}>
					<CardMedia>
						<img src="./assets/images/login_head.png"/>
					</CardMedia>
					<CardText>
						<TextField
						 	floatingLabelText="Username"
						 	onChange={this.onChangeUsername}
							style={{width: '100%'}}
							errorText={this.state.usernameErrorText}/> <br />
							<div style={{position: 'relative', display: 'inline-block', width: '100%'}}>
								{
									this.state.passwordType == 'password' ?
									<VisibilityIcon style={{
										position: 'absolute',
										right: 0, top: 35,
										width: 20, height: 20,
										zIndex: 1, cursor: 'pointer',
										color: 'rgba(255, 255, 255, 0.87)'
									}} onTouchTap={this.toggleShowPassword}/> :
									<VisibilityOffIcon style={{
										position: 'absolute',
										right: 0, top: 35,
										width: 20, height: 20,
										zIndex: 1, cursor: 'pointer',
										color: 'rgba(255, 255, 255, 0.87)'
									}} onTouchTap={this.toggleShowPassword}/>
								}
								<TextField
		 					 	floatingLabelText="Password"
		 						type={this.state.passwordType}
		 						onChange={this.onChangePassword}
		 						style={{width: '100%'}}
		 						errorText={this.state.passwordErrorText}/>
							</div>
						 	<br /><br />
						 	<RaisedButton
							  type="submit"
								primary={true}
								onClick={this.login}
								style={{width: '100%'}}
							>
								LOGIN
							</RaisedButton>
							<br /><br />
						<div style={{color: 'red', fontWeight: 'bold', textAlign: 'center'}}>{this.state.errMsg}</div>
					</CardText>
				</Card>
			</div>
		)
	}
}

Login.contextTypes = {
  router: PropTypes.object.isRequired
};
