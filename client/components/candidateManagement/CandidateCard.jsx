import React from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import {lightBlack} from 'material-ui/styles/colors';
import Request from 'superagent';
import jsPDF from 'jspdf';
import DownloadProfile from './DownloadProfile.jsx';
import dialog from '../../styles/dialog.json';

const styles = {
	profilePic: {
		height: 300,
		width: 300
	},
	actions: {
		textAlign: 'right'
	},
	cardClick: {
		cursor: 'pointer'
	},
	cardTitle: {
		paddingBottom: 0
	}
}

export default class CandidateCard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showDeleteDialog: false,
			showDownloadDialog: false,
			imageURL: '../../assets/images/avt-default.jpg',
		}
		this.getProfilePic = this.getProfilePic.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleCardClick = this.handleCardClick.bind(this);
		this.openDeleteDialog = this.openDeleteDialog.bind(this);
		this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
	}
	componentWillMount() {
		this.getProfilePic(this.props.candidate.EmployeeID);
	}
	componentWillReceiveProps(nextProps) {
		this.getProfilePic(nextProps.candidate.EmailID);
	}
	getProfilePic(emailID) {
		let th = this;
		let username = emailID.split("@wipro.com")[0];
		Request
			.get(`/dashboard/getimage`)
			.set({'Authorization': localStorage.getItem('token')})
			.query({filename: username})
			.end(function(err, res) {
				if(err) {
		    	console.log('Image not found for ', username);
					th.setState({
						imageURL: '../../assets/images/avt-default.jpg'
					})
				}
		    else {
		    	if(res.text) {
		    		let array = new Uint8Array(res.text.length);
		        for (var i = 0; i < res.text.length; i++){
		            array[i] = res.text.charCodeAt(i);
		        }
		        let blob = new Blob([array], {type: 'image/jpeg'});
			    	let blobUrl = URL.createObjectURL(blob);
			    	th.setState({
			    		imageURL: res.text
			    	})
		    	}
		    }
			})
	}
	handleCardClick() {
		this.props.handleCardClick(this.props.candidate);
	}
	openDeleteDialog() {
		this.setState({
			showDeleteDialog: true
		})
	}
	closeDeleteDialog() {
		this.setState({
			showDeleteDialog: false
		})
	}
	handleDelete() {
		this.props.handleDelete(this.props.candidate);
	}

	render() {
		const deleteDialogActions = [
      <FlatButton
        label="Cancel"
        style={dialog.actionButton}
        onTouchTap={this.closeDeleteDialog}
      />,
      <FlatButton
        label="Delete"
        style={dialog.actionButton}
        onTouchTap={this.closeDeleteDialog}
        onClick={this.handleDelete}
      />
    ]
		return(
			<div style={{width: '285px', display: 'inline-block', padding: '5px'}} key={this.props.k}>
				<Card style={{border: '2px solid silver'}}>
			    <CardMedia
			    	style={styles.cardClick}
			    	onClick={this.handleCardClick}
			      overlay={
			      	<CardTitle
			      		title={this.props.candidate.EmployeeName}
			      		subtitle={this.props.candidate.EmailID}
			      	/>
			      }
			    >
			      <img style={styles.profilePic} src={this.state.imageURL} />
			    </CardMedia>
			    <CardTitle
			    	title={this.props.candidate.EmployeeID}
			    	subtitle={this.props.candidate.CareerBand}
			    	style={styles.cardTitle}
			    />
			    <CardActions style={styles.actions}>
			    	<IconButton
			    		tooltip="Download Profile"
			    		style={{float: 'left'}}
			    	>
				      <DownloadProfile
				      	color={lightBlack}
				      	candidate={this.props.candidate}
				      	imageURL={this.state.imageURL}
								role={this.props.role}
								zip = {false}
				      />
				    </IconButton>
				    <IconButton tooltip="Delete Candidate" onTouchTap={this.openDeleteDialog}>
				      <DeleteIcon color={lightBlack} />
				    </IconButton>
			    </CardActions>
			  </Card>
			  <Dialog
          actions={deleteDialogActions}
					actionsContainerStyle={dialog.actionsContainer}
					bodyStyle={dialog.confirmBox}
          open={this.state.showDeleteDialog}
          onRequestClose={this.closeDeleteDialog}
        >
        	Are you sure you want to delete this candidate?
        </Dialog>
			</div>
		)
	}

}
