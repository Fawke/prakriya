import React from 'react';
import Request from 'superagent';
import AddRole from './AddRole.jsx';
import RoleItem from './RoleItem.jsx';
import {Grid, Row, Col} from 'react-flexbox-grid';

const styles = {
	heading: {
		textAlign: 'center'
	},
	col: {
		marginBottom: '15px'
	}
}

export default class RoleManagement extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			roles: [],
			controls: []
		}
		this.getRoles = this.getRoles.bind(this);
		this.getAccessControls = this.getAccessControls.bind(this);
		this.addRole = this.addRole.bind(this);
		this.deleteRole = this.deleteRole.bind(this);
		this.savePermissions = this.savePermissions.bind(this);
	}
	componentWillMount() {
		this.getRoles();
		this.getAccessControls();
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
		    	th.setState({
		    		roles: res.body
		    	})
		    }
			})
	}
	getAccessControls() {
		let th = this
		Request
			.get('/admin/accesscontrols')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.setState({
		    		controls: res.body
		    	})
		    }
			})
	}

	addRole(role) {
		let th = this
		Request
			.post('/admin/addrole')
			.set({'Authorization': localStorage.getItem('token')})
			.send(role)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Added role and Server responded',res.body)
		    	let roles = th.state.roles;
		    	roles.push(res.body);
		    	th.setState({
		    		roles: roles
		    	})
		    }
			})
	}
	deleteRole(role) {
		let th = this
		let roleObj = {
      "name": role
    }
		Request
			.delete('/admin/deleterole')
			.set({'Authorization': localStorage.getItem('token')})
			.send(roleObj)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	let roles = th.state.roles.filter(function(roleObj) {
		    		return role != roleObj.name;
		    	})
		    	th.setState({roles: roles})
		    }
		  })
	}
	savePermissions(roleObj) {
		let th = this;
		Request
			.post('/admin/updaterole')
			.set({'Authorization': localStorage.getItem('token')})
			.send(roleObj)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Updated role and Server responded', res.body)
		    	th.getRoles();
		    }
			})
	}

	render() {
		let th = this;
		return (
			<div >
				<AddRole controls={this.state.controls} addRole={this.addRole}/>
				<h1 style={styles.heading}>Role Management</h1>
				<Grid>
					<Row>
						{
							this.state.controls.length > 0 &&
							this.state.roles.map(function (role, index) {
								return(
									role.name != "admin" &&
									<Col style={styles.col} md={6} key={index}>
										<RoleItem
											roleperm={role}
											controls={th.state.controls}
											deleteRole={th.deleteRole}
											savePermissions={th.savePermissions}
									 	/>
								 	</Col>
								)
							})
						}
					</Row>
				</Grid>
			</div>
		)
	}
}
