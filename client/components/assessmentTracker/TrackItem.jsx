import React from 'react';
import {Card, CardText, CardHeader} from 'material-ui/Card';
import {Grid, Row, Col} from 'react-flexbox-grid';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import SaveIcon from 'material-ui/svg-icons/content/save';
import {lightBlack} from 'material-ui/styles/colors';

const styles = {
	card: {
		box: {
				border: '0.5px solid #009ab1',
				padding: '5px'
		},
		header: {
			backgroundColor: '#00bcd4'
		},
		title: {
			fontWeight: 'bold',
			fontSize: '1.2em'
		},
		text: {
			border: '1px solid #c4edf2',
			borderTop: '0.5px solid white'
		}
	},
	action: {
		save: {
			position:'absolute',
      right: '10px',
			bottom: '15px'
		}
	},
	underline: {
		display: 'none'
	}
}

export default class TrackItem extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
      track: {
        candidateID: '',
        candidateName: '',
        candidateEmail: '',
				categories: [],
        comments: []
      },
			saveDisabled: true
		}
		this.onCommentChange = this.onCommentChange.bind(this)
		this.updateComments = this.updateComments.bind(this)
		this.saveComments = this.saveComments.bind(this)
	}

  componentWillMount() {
		let th = this
		if(th.props.track.comments.length == undefined)
			th.props.track.comments = new Array(th.props.track.categories.length)
    th.setState({
      track: th.props.track
    })
  }

	onCommentChange(index, e) {

		if(this.state.saveDisabled) this.setState({
			saveDisabled: false
		})
		let track = this.state.track
		track.comments[index] = e.target.value
		this.setState({
			track: track
		})
	}

	updateComments() {
		this.props.onUpdateComments(this.state.track.comments)
	}

	saveComments() {
		console.log('Save Initiated')
		this.setState({
			saveDisabled: true
		})
		this.props.onSaveComments()
	}

	render() {
		let th = this;

		return (
				<Card style={styles.card.box}>
					<CardHeader
			      title={th.state.track.candidateName}
			      subtitle={"ID: " + th.state.track.candidateID + ". Email: " + th.state.track.candidateEmail}
						style={styles.card.header}
						titleStyle={styles.card.title}
			    >
					<IconButton tooltip="Save Assessment" onClick={this.saveComments} disabled={this.state.saveDisabled} style={styles.action.save}>
						<SaveIcon color={lightBlack} />
					</IconButton>
			    </CardHeader>
          {
              th.state.track.categories.map(function(category, index) {
								let value = th.state.track.comments[index] === undefined ?
								'' : th.state.track.comments[index]
                return (
                  <CardText key={index} style={styles.card.text}>
										<TextField
							    		hintText='enter your review here'
							    		floatingLabelText={category}
							    		value={value}
											onChange={(e)=>{e.persist(); th.onCommentChange(index, e)}}
											onBlur={th.updateComments}
											fullWidth={true}
											multiLine={true}
											underlineStyle={styles.underline}
							    	/>
                  </CardText>
                )
              })
          }
			  </Card>
		);
	}
}
