import React from 'react';
import Request from 'superagent';

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props)
		this.authenticate = this.authenticate.bind(this)
	}

	authenticate() {
		Request
			.get('/dashboard/user')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
				console.log(res);
			});
	}

	

	render() {
		return(
			<div>
				<h1>This is the dashboard</h1>				
			</div>
		)
	}

}