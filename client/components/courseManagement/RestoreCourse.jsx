import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
	heading: {
		textAlign: 'center'
	},
	dialog: {
	  textAlign: 'center'
	},
	col: {
		marginBottom: 20
	}
}

export default class AddCourse extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDialog: false,
			actions: []
		}
		this.handleRestore = this.handleRestore.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.onChangeActions = this.onChangeActions.bind(this);
	}
	componentDidMount() {
		this.setState({
			showDialog: this.props.openDialog
		})
	}
	onChangeActions(event, isChecked) {
		let actionList = this.state.actions
		if(isChecked) {
			actionList.push(event.target.value)
			this.setState({actions: actionList})
		}
		else {
			actionList = this.state.actions.filter(function(item) {
				return item != event.target.value;
			})
			this.setState({actions: actionList})
			console.log(this.state.actions);
		}
	}

	handleRestore() {
		this.props.handleRestore(this.state.actions);
	}

	handleClose() {
		this.setState({
			showDialog: false
		})
		this.props.handleClose();
	}

	render() {
		let th = this;
		return(
			<div>
				<div>
				<Dialog
		    	style={styles.dialog}
          title="Restore Course"
          open={this.state.showDialog}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose}
        >
				{
							this.props.course.map(function (course, key) {
								if(course.Removed)
								{
									return (
										<Checkbox
													label={course.CourseName}
													value={course.CourseName}
													onCheck={th.onChangeActions}
													key={key}
												/>
										)
								}
							})
						}
						<div>
      						<RaisedButton
						    	 		label="Restore Course"
						    	   	primary={true}
						    			onClick={this.handleRestore}
						    	 	/>
				    				&emsp;
					    			<RaisedButton
						    	 		label="Cancel"
						    	   	primary={true}
						    			onTouchTap={this.handleClose}
						    	 	/>
				    			</div>
				</Dialog>
			</div>
		</div>	
		)
	}
}