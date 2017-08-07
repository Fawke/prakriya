import React from 'react';
import Avatar from 'material-ui/Avatar';
import Request from 'superagent';

const styles = {
	profilePic: {
		height: 100,
		width: 100,
		border: '5px solid teal',
		borderRadius: 75
	}
}
export default class CandidateCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imageURL: '../../assets/images/avt-default.jpg'
		}
		this.getProfilePic = this.getProfilePic.bind(this);
	}

	componentWillMount() {
		this.getProfilePic(this.props.cadet.EmailID)
	}

	getProfilePic(emailID) {
		let th = this;
		let username = emailID.split("@wipro.com")[0];
		Request
			.get(`/dashboard/getimage`)
			.set({'Authorization': localStorage.getItem('token')})
			.query({filename: username})
			.end(function(err, res) {
				if(err)
		    	console.log('Image not found for ', eid);
		    else {
		    	if(res.text) {
			    	th.setState({
			    		imageURL: res.text
			    	})
		    	}
		    }
			})
	}

	render() {
		return(
			<span><br/><img style={styles.profilePic} src={this.state.imageURL} />
				<h3>{this.props.cadet.EmployeeName}</h3></span>
			)
	}
}
