import React from 'react';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import AddUser from './AddUser.jsx';
import UserList from './UserList.jsx';

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
};



export default class Users extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			users: []
		}
		this.addUser = this.addUser.bind(this);
		this.deleteUser = this.deleteUser.bind(this);
		this.updateUser = this.updateUser.bind(this);
	}

	componentDidMount() {
		this.getUsers();
	}

	getUsers() {
		let th = this;
		Request
			.get('/admin/users')
			.set({'Authorization': localStorage.getItem('token')})			
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else
		    	th.setState({
		    		users: res.body
		    	}) 
		    	console.log("Users");
		    	console.log(th.state.users);
		  });
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
		    	th.getUsers();
		    }
		  });
	} 

	updateUser(user) {
		let th = this
		console.log(user)
		Request
			.post('/admin/updateuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send(user)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.getUsers();
		    }
		  });
	} 

	deleteUser(user) {
		console.log('Role from request',user)
		let th = this
		Request
			.delete('/admin/deleteuser')
			.set({'Authorization': localStorage.getItem('token')})
			.send({username: user.username})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.getUsers();
		    }
		  })
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
									user.role != "admin" &&
									<Col style={styles.card} md={3} key={index}>
										 
											<UserList  currUser={user} deleteUser={th.deleteUser} updateUser={th.updateUser} />
										
									</Col>
									
								)
							})
						}
						<Col style={styles.addUser} md={3}>
							<AddUser addUser={this.addUser}/>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}