import React from 'react';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import AddUser from './AddUser.jsx';
import UserList from './UserList.jsx';
import Snackbar from 'material-ui/Snackbar';

const styles = {
	heading: {
		textAlign: 'center'
	},
	card: {
		padding: '20px 10px',
		height: 'auto'
	},
	addUser: {
		padding: '20px 10px'
	}
}

const style = {
  height: 100,
  width: 100,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
}


let USERS = [];

export default class Users extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			users: [],
			roles: [],
      snackbarOpen: false,
			snackbarMessage: ''
		}
		this.getRoles = this.getRoles.bind(this);
		this.getUsers = this.getUsers.bind(this);
		this.getProfilePic = this.getProfilePic.bind(this);
		this.addUser = this.addUser.bind(this);
		this.deleteUser = this.deleteUser.bind(this);
		this.updateUser = this.updateUser.bind(this);
		this.lockUser = this.lockUser.bind(this);
		this.unlockUser = this.unlockUser.bind(this);
    this.hideSnackbar = this.hideSnackbar.bind(this);
    this.openSnackbar = this.openSnackbar.bind(this);
		this.getUserIndex = this.getUserIndex.bind(this);
	}

	componentWillMount() {
		this.getUsers()
		this.getRoles()
	}

	getRoles() {
		let th = this
		Request
			.get('/admin/roles')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	let roles = []
		    	res.body.map(function (role, index) {
						roles.push(role.name);
					})
		    	th.setState({
		    		roles: roles
		    	})
		    }
			})
	}

	getUsers() {
		let th = this;
		Request
			.get('/admin/users')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
		    if(err) {
					console.log(err)
				} else {
					res.body.map(function(user) {
						th.getProfilePic(user)
					})
					console.log('res.body: ', res.body)
					th.setState({
						users: res.body
					})
					console.log('users: ', th.state.users)
				}
		  })
	}

	getProfilePic(user, i, arr) {
  	Request
  		.get(`/dashboard/getimage`)
  		.set({'Authorization': localStorage.getItem('token')})
      .query({filename: user.username})
  		.end(function(err, res) {
  			if(err) {
					user.profilePic = '../../../assets/images/avt-default.jpg'
				} else {
  	    	if(res.text) {
  		    	user.profilePic = res.text
  	    	} else {
						user.profilePic = '../../../assets/images/avt-default.jpg'
					}
  	    }
  		})
  }

	addUser(user) {
		let th = this
		Request
			.post('/admin/adduser')
			.set({'Authorization': localStorage.getItem('token')})
			.send(user)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
					let users = th.state.users;
					let addedUser = res.body;
					addedUser.password = user.password;
					users.push(addedUser);
					th.setState({
						users: users
					});
					th.openSnackbar('New user added successfully.');
		    }
		  });
	}

	updateUser(user) {
		let th = this
		Request
			.post('/admin/updateuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send(user)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
					let users = th.state.users;
					let index = th.getUserIndex(user.username, users);
					users[index].name = user.name;
					users[index].email = user.email;
					users[index].password = user.password;
					users[index].role = user.role;
					th.setState({
						users: users
					});
					th.openSnackbar('User updated added successfully.');
		    }
		  });
	}

	deleteUser(user) {
		let th = this
		Request
			.delete('/admin/deleteuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send({username: user.username})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					let users = th.state.users;
					let index = th.getUserIndex(user.username, users);
					users.splice(index, 1);
					th.setState({
						users: users
					});
					th.openSnackbar('User deleted added successfully.');
		    }
		  })
	}

	lockUser(user) {
		let th = this
		Request
			.post('/admin/lockuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send(user)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
					let users = th.state.users;
					let index = th.getUserIndex(user.username, users);
					users[index].actions = users[index].actions.filter(function(action) {
						return action != 'login'
					});
					th.setState({
						users: users
					});
					th.openSnackbar('User account locked.');
		    }
		  });
	}

	unlockUser(user) {
		let th = this
		Request
			.post('/admin/unlockuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send(user)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
					let users = th.state.users;
					let index = th.getUserIndex(user.username, users);
					users[index].actions.push('login');
					th.setState({
						users: users
					});
					th.openSnackbar('User account unlocked.');
		    }
		  });
	}

	openSnackbar(message) {
		this.setState({
			snackbarMessage: message,
			snackbarOpen: true
		});
	}

	hideSnackbar() {
		this.setState({
			snackbarMessage: '',
			snackbarOpen: false
		});
	}

	getUserIndex(username, users) {
		let index = 0;
		users.some(function(u, i) {
			if(u.username == username) index = i;
			return u.username == username;
		});
		return index;
	}

	render() {
		let th = this;
		return (
			<div >

				<h1 style={styles.heading}>User Management</h1>
				<Grid>
					<Row>
						{
							this.state.users.map(function (user, index) {
								return(
									<Col style={styles.card} md={3} key={index}>
										<UserList  currUser={user} lockUser={th.lockUser} unlockUser={th.unlockUser} roles={th.state.roles} deleteUser={th.deleteUser} updateUser={th.updateUser} />
									</Col>
								)
							})
						}
						<Col style={styles.addUser} md={3}>
							{
								this.state.roles.length > 0 &&
								<AddUser roles={this.state.roles} addUser={this.addUser}/>
							}
						</Col>
					</Row>
				</Grid>
				<Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={this.hideSnackbar}
       />
			</div>
		);
	}
}
