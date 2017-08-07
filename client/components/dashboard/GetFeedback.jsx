import React from 'react';
import jsPDF from 'jspdf';
import LinearProgress from 'material-ui/LinearProgress';
import Request from 'superagent';
import Moment from 'moment';
import Paper from 'material-ui/Paper';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import CONFIG from '../../config/index';

const styles = {
	container: {
		padding: 20,
		borderRadius: 5,
		backgroundColor: '#C6D8D3'
	}
}

const FEEDBACK_CATEGORIES = CONFIG.FEEDBACK.CATEGORIES;

export default class WaveDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			feedbacks: [],
			waveIDs: [],
			waveID: ''
		};
		this.getWaves = this.getWaves.bind(this);
		this.onIDChange = this.onIDChange.bind(this);
		this.onIDSelect = this.onIDSelect.bind(this);
		this.getFeedbacks = this.getFeedbacks.bind(this);
		this.createFeedback = this.createFeedback.bind(this);
		this.downloadFeedbacks = this.downloadFeedbacks.bind(this);
		this.getFeedbackFields = this.getFeedbackFields.bind(this);
	}

	componentWillMount() {
		this.getWaves();
	}

	onIDChange(val) {
		let th = this;
		this.getFeedbackFields(val);
		this.setState({
			waveID: val
		})
	}

	onIDSelect(val) {
		let th = this;
		this.getFeedbacks(val);
	}

	downloadFeedbacks() {
			let th = this;
			console.log('downloading feedback...');

			let doc = new jsPDF()

			this.state.feedbacks.map(function(feedback, index) {
				th.createFeedback(doc, feedback);
				if(index+1 != th.state.feedbacks.length) doc.addPage();
			});

			doc.save('feedbacks_' + this.state.waveID + '.pdf')
	}

	createFeedback(doc, feedback) {

		console.log('feedback: ', feedback)

		let x = 5;
		let y = 5;

		doc.setFontSize(10);

		doc.setLineWidth(0.10);
		doc.rect(x, y, 200, 6, 'S');
		doc.setFontStyle('bold');
		doc.text(x+100, y+4, 'Cadet Feedback Form', 'center');

		doc.setFontStyle('default');
		doc.rect(x, y+=6, 25, 6, 'S');
		doc.text(x+2, y+4, 'Name');
		doc.rect(x+25, y, 125, 6, 'S');
		doc.text(x+27, y+4, feedback.cadetName);
		doc.rect(x+125, y, 25, 6, 'S');
		doc.text(x+127, y+4, 'Date');
		doc.rect(x+150, y, 50, 6, 'S');
		doc.text(x+152, y+4, feedback.submittedOn);

		doc.rect(x, y+=6, 25, 6, 'S');
		doc.text(x+2, y+4, 'Organization');
		doc.rect(x+25, y, 125, 6, 'S');
		doc.text(x+27, y+4, feedback.organization);
		doc.rect(x+125, y, 25, 6, 'S');
		doc.text(x+127, y+4, 'Wave (Course)');
		doc.rect(x+150, y, 50, 6, 'S');
		doc.text(x+152, y+4, feedback.waveID);

		let lines = doc.splitTextToSize(CONFIG.FEEDBACK.EXTRA, 200);
		doc.text(x+2, y+=12, lines);

		doc.rect(x, y+=8, 175, 6);
		doc.text(x+2, y+4, CONFIG.FEEDBACK.STARS);
		doc.rect(x+175, y, 5, 6);
		doc.text(x+177, y+4, '1');
		doc.rect(x+180, y, 5, 6);
		doc.text(x+182, y+4, '2');
		doc.rect(x+185, y, 5, 6);
		doc.text(x+187, y+4, '3');
		doc.rect(x+190, y, 5, 6);
		doc.text(x+192, y+4, '4');
		doc.rect(x+195, y, 5, 6);
		doc.text(x+197, y+4, '5');

		FEEDBACK_CATEGORIES.map(function(CATEGORY) {
			doc.rect(x, y+=6, 200, 6);
			doc.setFontStyle('bold');
			doc.text(x+2, y+4, CATEGORY.alias);
			CATEGORY.options.map(function(option, index) {
				doc.setFontStyle('default');
				doc.rect(x, y+=6, 175, 6);
				doc.text(x+2, y+4, doc.splitTextToSize(option, 175));
				doc.rect(x+175, y, 5, 6);
				if(feedback[CATEGORY.type][index] == 1) {
					doc.text(x+177, y+4,'+');
				}
				doc.rect(x+180, y, 5, 6);
				if(feedback[CATEGORY.type][index] == 2) {
					doc.text(x+182, y+4,'+');
				}
				doc.rect(x+185, y, 5, 6);
				if(feedback[CATEGORY.type][index] == 3) {
					doc.text(x+187, y+4,'+');
				}
				doc.rect(x+190, y, 5, 6);
				if(feedback[CATEGORY.type][index] == 4) {
					doc.text(x+192, y+4,'+');
				}
				doc.rect(x+195, y, 5, 6);
				if(feedback[CATEGORY.type][index] == 5) {
					doc.text(x+197, y+4,'+');
				}
			});
		});

		doc.setFontStyle('bold');
		doc.text(x+2, y+=12, 'YOUR COMMENTS')

		doc.setFontStyle('default');
		doc.rect(x, y+=4, 200, 6);
		doc.text(x+2, y+4, 'Things you learnt / liked most about the program');
		doc.rect(x, y+=6, 200, 14);
		doc.text(x+2, y+4, doc.splitTextToSize(feedback.mostLiked, 200));

		doc.rect(x, y+=14, 200, 6);
		doc.text(x+2, y+4, 'Things you liked least about of the program');
		doc.rect(x, y+=6, 200, 14);
		doc.text(x+2, y+4, doc.splitTextToSize(feedback.leastLiked, 200));
	}

	getWaves() {
		let th = this;
		Request
			.get('/dashboard/waves')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
				if(err)
					console.log('Error in fetching waves: ', err)
				else {
					console.log('All Waves: ', res.body)
					let waveIDs = res.body.map(function(wave) {
						console.log(wave.WaveID + ' (' + wave.CourseName + ')')
						return wave.WaveID + ' (' + wave.CourseName + ')'
					});
					th.setState({
						waveIDs: waveIDs
					});
				}
			});
	}

	getFeedbacks(waveID) {
		let th = this;
		console.log('should get feedbacks for ', waveID);
		Request
			.get('/dashboard/feedbacksforwave')
			.set({'Authorization': localStorage.getItem('token')})
			.query({waveID: waveID})
			.end(function(err, res){
				if(err)
					console.log('Error in fetching feedbacks: ', err)
				else {
					th.setState({
						feedbacks: res.body
					});
					console.log('All Feedbacks: ', res.body)
				}
			});
	}

	getFeedbackFields(waveID) {
		let th = this;
		let wave = waveID.split('(')[0].trim();
		let course = waveID.split('(')[1].split(')')[0];
		Request
			.get('/dashboard/courseforwave')
			.set({'Authorization': localStorage.getItem('token')})
			.query({waveID: wave, course: course})
			.end(function(err, res){
				if(err)
					console.log('Error in fetching feedback fields: ', err)
				else {
					// configuring the course specific feedback data
          FEEDBACK_CATEGORIES[2].options = res.body.FeedbackFields;
				}
			});
	}

	render() {
		let th = this;
		let buttonDisabled = this.state.feedbacks.length === 0;
		return(
			<Paper style={styles.container}>
					<h3>Download Feedbacks</h3>
					<div>
					<div style={{width: '49%', display: 'inline-block', boxSizing: 'border-box'}}>
						<AutoComplete
				      floatingLabelText='Wave ID'
				      filter={AutoComplete.fuzzyFilter}
				      dataSource={this.state.waveIDs}
							onUpdateInput={this.onIDChange}
							onNewRequest={this.onIDSelect}
				      listStyle={{ maxHeight: 80, overflow: 'auto' }}

						    />
					</div>
					<div style={{width: '49%', display: 'inline-block', boxSizing: 'border-box'}}>
						<RaisedButton
						  type="submit"
							primary={true}
							style={{width: '100%'}}
							disabled={buttonDisabled}
							onClick={this.downloadFeedbacks}
							>
							Download
						</RaisedButton>
					</div>
					</div>
			</Paper>
		)
	}
}
